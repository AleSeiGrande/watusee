// ============================================================================
// Planes de WatDuSee
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

import { getSettingsMap, resolveKey, SETTING_KEYS } from './settings';

export type BillingInterval = 'monthly' | 'yearly';

export type PlanCtaKind = 'free' | 'checkout' | 'donate';

export interface PlanDefinition {
  /** Identificador estable (se guarda en la base de datos). */
  id: string;
  /** Nombre visible: nombre de artista. No se traduce (es un nombre propio). */
  name: string;
  /** true = plan recomendado / destacado en la página. */
  highlight?: boolean;
  /** Precio mensual en la moneda configurada. 0 = gratis, null = "a voluntad". */
  priceMonthly: number | null;
  /** Precio anual. 0 = gratis, null = "a voluntad". */
  priceYearly: number | null;
  ctaKind: PlanCtaKind;
  /** Claves i18n de las features incluidas. */
  featureKeys: string[];
  /** Clave de configuración (panel de admin / .env) con la URL de pago. */
  settingMonthly?: string;
  settingYearly?: string;
  /** Clave de configuración con el link de donación (PayPal, Ko-fi...). */
  settingDonate?: string;
}

/** Plan ya resuelto con las URLs de pago, listo para pasar al cliente. */
export interface ResolvedPlan {
  id: string;
  name: string;
  highlight: boolean;
  /**
   * true = plan de pago sin link de checkout configurado: la página de precios
   * muestra `$$$` + "En construcción" y deshabilita el CTA.
   * Se resuelve en cada request: pegar un link en `/admin` lo pone a la venta.
   */
  comingSoon: boolean;
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
    highlight: true,
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
    id: 'mecenas',
    name: 'Mecenas',
    highlight: true,
    priceMonthly: null,
    priceYearly: null,
    ctaKind: 'donate',
    settingDonate: SETTING_KEYS.donate,
    featureKeys: [
      'pricing.mecenas.f1',
      'pricing.mecenas.f2',
      'pricing.mecenas.f3',
      'pricing.mecenas.f4',
    ],
  },
  {
    id: 'frida',
    name: 'Frida',
    priceMonthly: 2.99,
    priceYearly: 29,
    ctaKind: 'checkout',
    settingMonthly: SETTING_KEYS.fridaMonthly,
    settingYearly: SETTING_KEYS.fridaYearly,
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
    priceMonthly: 4.99,
    priceYearly: 49,
    ctaKind: 'checkout',
    settingMonthly: SETTING_KEYS.davinciMonthly,
    settingYearly: SETTING_KEYS.davinciYearly,
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
];

/**
 * Resuelve los planes con sus links de pago. Prioriza la configuración guardada
 * desde el panel de admin (/admin) y cae a las variables de entorno.
 * Se ejecuta en el servidor y el resultado (serializable) se pasa al cliente.
 */
export async function getPlans(): Promise<ResolvedPlan[]> {
  const db = await getSettingsMap();
  return PLANS.map((plan) => {
    const checkout = {
      monthly: plan.settingMonthly ? resolveKey(plan.settingMonthly, db) : null,
      yearly: plan.settingYearly ? resolveKey(plan.settingYearly, db) : null,
    };
    return {
      id: plan.id,
      name: plan.name,
      highlight: Boolean(plan.highlight),
      comingSoon: plan.ctaKind === 'checkout' && !checkout.monthly && !checkout.yearly,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      ctaKind: plan.ctaKind,
      featureKeys: plan.featureKeys,
      checkout,
      donateUrl: plan.settingDonate ? resolveKey(plan.settingDonate, db) : null,
    };
  });
}

export async function getPlanById(id: string): Promise<ResolvedPlan | undefined> {
  const plans = await getPlans();
  return plans.find((plan) => plan.id === id);
}

/** true si el plan es de pago (no free ni donación). */
export function isPaidPlan(plan: ResolvedPlan): boolean {
  return plan.ctaKind === 'checkout';
}
