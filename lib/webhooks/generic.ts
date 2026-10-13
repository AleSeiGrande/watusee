// ============================================================================
// Webhook genérico (cualquier proveedor, o Zapier / Make)
// ----------------------------------------------------------------------------
// Endpoint:  POST /api/webhooks/generic
// Autenticación: cabecera `x-webhook-secret` = GENERIC_WEBHOOK_SECRET.
//
// Body (JSON):
//   {
//     "action": "activate" | "cancel",   // por defecto "activate"
//     "plan": "frida" | "davinci" | "mecenas",
//     "interval": "monthly" | "yearly",
//     "userId": "<id>",                  // o "email": "<correo>"
//     "email": "user@example.com",
//     "status": "active",                // opcional
//     "currentPeriodEnd": "2027-01-01T00:00:00Z",  // opcional
//     "providerSubscriptionId": "sub_123",          // opcional
//     "eventId": "evt_123",              // opcional (idempotencia)
//     "type": "mi.proveedor.pago"        // opcional
//   }
//
// Para cancelar: { "action": "cancel", "providerSubscriptionId": "sub_123" }
// ============================================================================

import { NextResponse } from 'next/server';
import {
  applySubscription,
  cancelSubscriptionByRef,
  isPaidPlan,
  normalizeInterval,
  PAID_PLANS,
  resolveUserIdByEmail,
} from '@/lib/billing';
import { readObject, readString, safeEqual, toDate } from '@/lib/webhooks/utils';

export async function handleGenericWebhook(req: Request, rawBody: string): Promise<NextResponse> {
  const secret = process.env.GENERIC_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'GENERIC_WEBHOOK_SECRET no está configurado' }, { status: 503 });
  }

  const provided = req.headers.get('x-webhook-secret');
  if (!provided || !safeEqual(provided, secret)) {
    return NextResponse.json({ error: 'Secreto inválido' }, { status: 401 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const body = readObject(parsed);

  const action = readString(body.action) === 'cancel' ? 'cancel' : 'activate';
  const eventId = readString(body.eventId);
  const eventType = readString(body.type) ?? `generic.${action}`;

  if (action === 'cancel') {
    const providerSubscriptionId = readString(body.providerSubscriptionId);
    if (!providerSubscriptionId) {
      return NextResponse.json({ error: 'Falta providerSubscriptionId' }, { status: 400 });
    }
    const result = await cancelSubscriptionByRef({
      provider: 'generic',
      providerSubscriptionId,
      status: 'canceled',
      currentPeriodEnd: toDate(body.currentPeriodEnd),
      eventId,
      eventType,
      raw: body,
    });
    return NextResponse.json({ ok: true, ...result });
  }

  let userId = readString(body.userId);
  if (!userId) userId = await resolveUserIdByEmail(readString(body.email));
  if (!userId) {
    return NextResponse.json({ error: 'Falta userId (o email de un usuario existente)' }, { status: 400 });
  }

  const plan = body.plan;
  if (!isPaidPlan(plan)) {
    return NextResponse.json({ error: `plan inválido (usar: ${PAID_PLANS.join(', ')})` }, { status: 400 });
  }

  const result = await applySubscription({
    userId,
    plan,
    interval: normalizeInterval(body.interval),
    status: readString(body.status) ?? 'active',
    provider: 'generic',
    providerSubscriptionId: readString(body.providerSubscriptionId),
    providerCustomerId: readString(body.providerCustomerId),
    currentPeriodEnd: toDate(body.currentPeriodEnd),
    amount: typeof body.amount === 'number' ? body.amount : null,
    currency: readString(body.currency),
    eventId,
    eventType,
    raw: body,
  });
  return NextResponse.json({ ok: true, ...result });
}
