// ============================================================================
// Facturación — lógica de base de datos
// ----------------------------------------------------------------------------
// Aplica el estado de una suscripción a la base: actualiza `User` (plan,
// planStatus, planRenewsAt, isPatron), guarda `Subscription` y registra el
// `PaymentEvent` (idempotente por `eventId`).
//
// Es agnóstico del proveedor: tanto los webhooks (Stripe / genérico) como el
// panel de admin cargan por acá.
// ============================================================================

import { prisma } from '@/lib/prisma';
import {
  isPaidPlan,
  normalizeInterval,
  PAID_PLANS,
  type BillingInterval,
} from '@/lib/billing-shared';

export * from '@/lib/billing-shared';

const FREE_PLAN = 'banksy';
const VALID_STATUSES = new Set(['active', 'past_due', 'canceled', 'incomplete']);

function safeStatus(value: unknown): string {
  return typeof value === 'string' && VALID_STATUSES.has(value) ? value : 'active';
}

function safeJson(value: unknown): string {
  if (value === undefined || value === null) return '';
  try {
    return JSON.stringify(value).slice(0, 20000);
  } catch {
    return '';
  }
}

export interface ApplySubscriptionInput {
  userId: string;
  plan: string;
  interval?: string | null;
  status?: string | null;
  provider: string;
  providerSubscriptionId?: string | null;
  providerCustomerId?: string | null;
  currentPeriodEnd?: Date | null;
  amount?: number | null;
  currency?: string | null;
  /** ID del evento del proveedor, usado para idempotencia. */
  eventId?: string | null;
  eventType?: string | null;
  raw?: unknown;
}

export interface ApplyResult {
  applied: boolean;
  reason?: string;
  userId?: string;
}

/** Aplica (activa/renueva) una suscripción. Devuelve `applied: false` si ya estaba procesada. */
export async function applySubscription(input: ApplySubscriptionInput): Promise<ApplyResult> {
  const plan = isPaidPlan(input.plan) ? input.plan : null;
  if (!plan) return { applied: false, reason: `plan inválido (usar: ${PAID_PLANS.join(', ')})` };

  const status = safeStatus(input.status);
  const interval: BillingInterval = normalizeInterval(input.interval);
  const active = status === 'active';
  const isPatron = active && plan === 'mecenas';

  if (input.eventId) {
    const seen = await prisma.paymentEvent.findUnique({
      where: { eventId: input.eventId },
      select: { id: true },
    });
    if (seen) return { applied: false, reason: 'evento duplicado', userId: input.userId };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true },
  });
  if (!targetUser) return { applied: false, reason: 'usuario desconocido' };

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: input.userId },
      data: {
        plan: active ? plan : FREE_PLAN,
        planStatus: status,
        planRenewsAt: input.currentPeriodEnd ?? null,
        isPatron,
      },
    });

    if (input.providerSubscriptionId) {
      await tx.subscription.upsert({
        where: { providerSubscriptionId: input.providerSubscriptionId },
        create: {
          userId: input.userId,
          plan,
          interval,
          status,
          provider: input.provider,
          providerSubscriptionId: input.providerSubscriptionId,
          providerCustomerId: input.providerCustomerId ?? null,
          currentPeriodEnd: input.currentPeriodEnd ?? null,
          amount: input.amount ?? null,
          currency: input.currency ?? null,
        },
        update: {
          plan,
          interval,
          status,
          provider: input.provider,
          providerCustomerId: input.providerCustomerId ?? undefined,
          currentPeriodEnd: input.currentPeriodEnd ?? null,
          amount: input.amount ?? undefined,
          currency: input.currency ?? undefined,
        },
      });
    } else {
      await tx.subscription.create({
        data: {
          userId: input.userId,
          plan,
          interval,
          status,
          provider: input.provider,
          providerCustomerId: input.providerCustomerId ?? null,
          currentPeriodEnd: input.currentPeriodEnd ?? null,
          amount: input.amount ?? null,
          currency: input.currency ?? null,
        },
      });
    }

    if (input.eventId) {
      await tx.paymentEvent.create({
        data: {
          provider: input.provider,
          eventId: input.eventId,
          type: input.eventType ?? 'subscription.applied',
          userId: input.userId,
          plan,
          amount: input.amount ?? null,
          currency: input.currency ?? null,
          raw: safeJson(input.raw),
        },
      });
    }
  });

  return { applied: true, userId: input.userId };
}

export interface CancelInput {
  provider: string;
  providerSubscriptionId: string;
  status?: string | null;
  currentPeriodEnd?: Date | null;
  eventId?: string | null;
  eventType?: string | null;
  raw?: unknown;
}

/** Cancela una suscripción por la referencia del proveedor y baja el plan si no queda otra activa. */
export async function cancelSubscriptionByRef(input: CancelInput): Promise<ApplyResult> {
  const subscription = await prisma.subscription.findUnique({
    where: { providerSubscriptionId: input.providerSubscriptionId },
  });
  if (!subscription) return { applied: false, reason: 'suscripción desconocida' };

  if (input.eventId) {
    const seen = await prisma.paymentEvent.findUnique({
      where: { eventId: input.eventId },
      select: { id: true },
    });
    if (seen) return { applied: false, reason: 'evento duplicado', userId: subscription.userId };
  }

  const status = safeStatus(input.status ?? 'canceled');

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: subscription.id },
      data: {
        status,
        currentPeriodEnd: input.currentPeriodEnd ?? subscription.currentPeriodEnd,
      },
    });

    const stillActive = await tx.subscription.count({
      where: { userId: subscription.userId, status: 'active', id: { not: subscription.id } },
    });

    if (stillActive === 0) {
      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          plan: FREE_PLAN,
          planStatus: status,
          planRenewsAt: null,
          isPatron: false,
        },
      });
    }

    if (input.eventId) {
      await tx.paymentEvent.create({
        data: {
          provider: input.provider,
          eventId: input.eventId,
          type: input.eventType ?? 'subscription.canceled',
          userId: subscription.userId,
          plan: subscription.plan,
          raw: safeJson(input.raw),
        },
      });
    }
  });

  return { applied: true, userId: subscription.userId };
}

/** Revoca manualmente el plan de un usuario (panel de admin). */
export async function revokeUserPlan(userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { plan: FREE_PLAN, planStatus: 'canceled', planRenewsAt: null, isPatron: false },
    });
    await tx.subscription.updateMany({
      where: { userId, status: 'active' },
      data: { status: 'canceled' },
    });
  });
}

/** Busca un usuario por email (para webhooks que solo traen el correo). */
export async function resolveUserIdByEmail(email?: string | null): Promise<string | null> {
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

/** Busca una suscripción guardada por la referencia del proveedor. */
export async function getSubscriptionByProviderRef(providerSubscriptionId: string) {
  return prisma.subscription.findUnique({ where: { providerSubscriptionId } });
}
