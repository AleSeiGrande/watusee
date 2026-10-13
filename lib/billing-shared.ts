// ============================================================================
// Facturación — helpers puros (sin base de datos)
// ----------------------------------------------------------------------------
// Se pueden importar desde componentes cliente. La parte con base de datos
// vive en `lib/billing.ts`.
// ============================================================================

export type BillingInterval = 'monthly' | 'yearly';

export const PAID_PLANS = ['frida', 'davinci', 'mecenas'] as const;
export type PaidPlan = (typeof PAID_PLANS)[number];

export function isPaidPlan(value: unknown): value is PaidPlan {
  return typeof value === 'string' && (PAID_PLANS as readonly string[]).includes(value);
}

export function normalizeInterval(value: unknown): BillingInterval {
  return value === 'yearly' || value === 'year' || value === 'annual' ? 'yearly' : 'monthly';
}

/**
 * Identidad que se adjunta al link de checkout (`client_reference_id` en Stripe)
 * para que el webhook sepa a qué usuario y plan corresponde el pago.
 * Formato: `<userId>:<plan>:<interval>`.
 */
export function encodeCheckoutRef(userId: string, plan: string, interval: BillingInterval): string {
  return `${userId}:${plan}:${interval}`;
}

export function decodeCheckoutRef(
  ref: string | null | undefined,
): { userId: string; plan: PaidPlan; interval: BillingInterval } | null {
  if (!ref) return null;
  const parts = ref.split(':');
  if (parts.length < 2) return null;
  const [userId, plan, intervalRaw] = parts;
  if (!userId || !isPaidPlan(plan)) return null;
  return { userId, plan, interval: normalizeInterval(intervalRaw) };
}
