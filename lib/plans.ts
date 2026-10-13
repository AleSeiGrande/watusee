// ============================================================================
// Planes de WatUSee
// ----------------------------------------------------------------------------
// Este archivo es la ÚNICA fuente de verdad de la página de precios.
// Para cambiar nombres, precios o features: editá acá.
// Para conectar el cobro real: completá las variables de entorno en `.env`
// (ver `.env.example`). No hace falta tocar la UI ni la base de datos.
//
// Estrategia de pagos del MVP: "links de pago hospedados".
//   - Stripe Payment Links, Paddle o Lemon Squeezy generan una URL de checkout
//     sin backend. La pegás en la env var y listo.
//   - Así podés cambiar de proveedor cuando quieras sin tocar código.
// ----------------------------------------------------------------------------

export type BillingInterval = 'monthly' | 'yearly';

export type PlanCtaKind = 'free' | 'checkout' | 'donate';

export interface PlanDefinition {
  /** Identificador estable (se guarda en la base de datos). */
  id: string;
  /** Nombre visible: nombre de artista. No se traduce (es un nombre propio). */
  name: string;
  /** true = plan recomendado / "más elegido". */
  highlight?: boolean;
  /** Precio mensual en la moneda configurada. 0 = gratis, null = "a voluntad". */
  priceMonthly: number | null;
  /** Precio anual. 0 = gratis, null = "a voluntad". */
  priceYearly: number | null;
  ctaKind: PlanCtaKind;
  /** Claves i18n de las features incluidas. */
  featureKeys: string[];
  /** Env var con la URL de pago mensual / anual. */
  envMonthly?: string;
  envYearly?: string;
  /** Env var con el link de donación (PayPal, Buy Me a Coffee, Ko-fi...). */
  envDonate?: string;
}

/** Plan ya resuelto con las URLs de pago, listo para pasar al cliente. */
export interface ResolvedPlan {
  id: string;
  name: string;
  highlight: boolean;
  priceMonthly: number | null;
  priceYearly: number | null;
  ctaKind: PlanCtaKind;
  featureKeys: string[];
  checkout: Record<BillingInterval, string | null>;
  donateUrl: string | null;
}

/** Moneda que se muestra en la página. Cambiala por '€' si preferís euros. */
export const CURRENCY = '$';
export const CURRENCY_CODE = 'USD';

export const PLANS: PlanDefinition[] = [
  {
    id: 'banksy',
    name: 'Banksy',
    priceMonthly: 0,
    priceYearly: 0,
    ctaKind: 'free',
    featureKeys: [
      'pricing.banksy.f1',
      'pricing.banksy.f2',
      'pricing.banksy.f3',
      'pricing.banksy.f4',
    ],
  },
  {
    id: 'frida',
    name: 'Frida',
    highlight: true,
    priceMonthly: 4.99,
    priceYearly: 39,
    ctaKind: 'checkout',
    envMonthly: 'NEXT_PUBLIC_CHECKOUT_FRIDA_MONTHLY',
    envYearly: 'NEXT_PUBLIC_CHECKOUT_FRIDA_YEARLY',
    featureKeys: [
      'pricing.frida.f1',
      'pricing.frida.f2',
      'pricing.frida.f3',
      'pricing.frida.f4',
      'pricing.frida.f5',
      'pricing.frida.f6',
    ],
  },
  {
    id: 'davinci',
    name: 'Da Vinci',
    priceMonthly: 9.99,
    priceYearly: 79,
    ctaKind: 'checkout',
    envMonthly: 'NEXT_PUBLIC_CHECKOUT_DAVINCI_MONTHLY',
    envYearly: 'NEXT_PUBLIC_CHECKOUT_DAVINCI_YEARLY',
    featureKeys: [
      'pricing.davinci.f1',
      'pricing.davinci.f2',
      'pricing.davinci.f3',
      'pricing.davinci.f4',
      'pricing.davinci.f5',
      'pricing.davinci.f6',
      'pricing.davinci.f7',
    ],
  },
  {
    id: 'mecenas',
    name: 'Mecenas',
    priceMonthly: null,
    priceYearly: null,
    ctaKind: 'donate',
    envDonate: 'NEXT_PUBLIC_DONATE_URL',
    featureKeys: [
      'pricing.mecenas.f1',
      'pricing.mecenas.f2',
      'pricing.mecenas.f3',
      'pricing.mecenas.f4',
    ],
  },
];

function readEnv(key?: string): string | null {
  if (!key) return null;
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : null;
}

/**
 * Resuelve los planes con sus links de pago desde las variables de entorno.
 * Se ejecuta en el servidor y el resultado (serializable) se pasa al cliente.
 */
export function getPlans(): ResolvedPlan[] {
  return PLANS.map((plan) => ({
    id: plan.id,
    name: plan.name,
    highlight: Boolean(plan.highlight),
    priceMonthly: plan.priceMonthly,
    priceYearly: plan.priceYearly,
    ctaKind: plan.ctaKind,
    featureKeys: plan.featureKeys,
    checkout: {
      monthly: readEnv(plan.envMonthly),
      yearly: readEnv(plan.envYearly),
    },
    donateUrl: readEnv(plan.envDonate),
  }));
}

export function getPlanById(id: string): ResolvedPlan | undefined {
  return getPlans().find((plan) => plan.id === id);
}

/** true si el plan es de pago (no free ni donación). */
export function isPaidPlan(plan: ResolvedPlan): boolean {
  return plan.ctaKind === 'checkout';
}
