// ============================================================================
// Webhook de Stripe (sin SDK: verificación de firma con crypto)
// ----------------------------------------------------------------------------
// Configurá en Stripe el endpoint:  POST /api/webhooks/stripe
// y guardá el "Signing secret" en la variable de entorno STRIPE_WEBHOOK_SECRET.
//
// Eventos soportados:
//   - checkout.session.completed   -> activa el plan (usa client_reference_id)
//   - customer.subscription.updated -> refresca estado y fecha de renovación
//   - customer.subscription.deleted -> cancela y baja el plan
// ============================================================================

import crypto from 'crypto';
import { NextResponse } from 'next/server';
import {
  applySubscription,
  cancelSubscriptionByRef,
  decodeCheckoutRef,
  getSubscriptionByProviderRef,
  resolveUserIdByEmail,
} from '@/lib/billing';
import { readObject, readString, safeEqual, toDate } from '@/lib/webhooks/utils';

const TOLERANCE_SECONDS = 300;

/** Verifica la cabecera `stripe-signature` (t=...,v1=...). */
export function verifyStripeSignature(payload: string, header: string | null, secret: string): boolean {
  if (!header) return false;

  let timestamp = '';
  const signatures: string[] = [];
  for (const item of header.split(',')) {
    const index = item.indexOf('=');
    if (index === -1) continue;
    const key = item.slice(0, index).trim();
    const value = item.slice(index + 1).trim();
    if (key === 't') timestamp = value;
    else if (key === 'v1') signatures.push(value);
  }
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return false;

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  return signatures.some((signature) => safeEqual(signature, expected));
}

interface StripeEventShape {
  id?: unknown;
  type?: unknown;
  data?: { object?: unknown };
}

export async function handleStripeWebhook(req: Request, rawBody: string): Promise<NextResponse> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET no está configurado' }, { status: 503 });
  }
  if (!verifyStripeSignature(rawBody, req.headers.get('stripe-signature'), secret)) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  let event: StripeEventShape;
  try {
    event = JSON.parse(rawBody) as StripeEventShape;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const type = readString(event.type) ?? 'unknown';
  const eventId = readString(event.id) ?? `${type}:${Date.now()}`;
  const object = readObject(event.data?.object);

  switch (type) {
    case 'checkout.session.completed': {
      const ref = decodeCheckoutRef(readString(object.client_reference_id));
      const details = readObject(object.customer_details);
      const email = readString(details.email);
      const userId = ref?.userId ?? (await resolveUserIdByEmail(email));

      if (!userId || !ref) {
        return NextResponse.json({ ok: true, ignored: 'sin referencia de usuario/plan' });
      }

      const result = await applySubscription({
        userId,
        plan: ref.plan,
        interval: ref.interval,
        status: 'active',
        provider: 'stripe',
        providerSubscriptionId: readString(object.subscription),
        providerCustomerId: readString(object.customer),
        amount: typeof object.amount_total === 'number' ? object.amount_total : null,
        currency: readString(object.currency),
        eventId,
        eventType: type,
        raw: event,
      });
      return NextResponse.json({ ok: true, ...result });
    }

    case 'customer.subscription.updated': {
      const subscriptionId = readString(object.id);
      if (!subscriptionId) return NextResponse.json({ ok: true, ignored: 'sin id de suscripción' });

      const existing = await getSubscriptionByProviderRef(subscriptionId);
      if (!existing) return NextResponse.json({ ok: true, ignored: 'suscripción desconocida' });

      const rawStatus = readString(object.status);
      const status = rawStatus === 'active' || rawStatus === 'past_due' ? rawStatus : 'incomplete';
      const periodEndSeconds = typeof object.current_period_end === 'number' ? object.current_period_end : null;
      const currentPeriodEnd = periodEndSeconds ? new Date(periodEndSeconds * 1000) : null;

      const result = await applySubscription({
        userId: existing.userId,
        plan: existing.plan,
        interval: existing.interval,
        status,
        provider: 'stripe',
        providerSubscriptionId: subscriptionId,
        providerCustomerId: readString(object.customer) ?? existing.providerCustomerId,
        currentPeriodEnd,
        eventId,
        eventType: type,
        raw: event,
      });
      return NextResponse.json({ ok: true, ...result });
    }

    case 'customer.subscription.deleted': {
      const subscriptionId = readString(object.id);
      if (!subscriptionId) return NextResponse.json({ ok: true, ignored: 'sin id de suscripción' });

      const result = await cancelSubscriptionByRef({
        provider: 'stripe',
        providerSubscriptionId: subscriptionId,
        status: 'canceled',
        currentPeriodEnd: toDate(
          typeof object.current_period_end === 'number' ? object.current_period_end * 1000 : null,
        ),
        eventId,
        eventType: type,
        raw: event,
      });
      return NextResponse.json({ ok: true, ...result });
    }

    default:
      return NextResponse.json({ ok: true, ignored: type });
  }
}
