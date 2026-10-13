// ============================================================================
// Configuración editable desde el panel de administración (/admin)
// ----------------------------------------------------------------------------
// Los links de pago y de la Print Shop se pueden configurar de dos formas:
//   1. Variables de entorno (.env)  -> requieren rebuild/restart.
//   2. Panel de admin (/admin)      -> se guardan en la tabla `Setting`.
//
// Prioridad: valor guardado en la DB > variable de entorno > (nada).
// Así el dueño puede cambiar de proveedor de pagos desde la web, sin tocar
// el servidor. Ver también `lib/plans.ts` y `lib/merch.ts`.
// ============================================================================

import { prisma } from '@/lib/prisma';

export type SettingGroup = 'checkout' | 'donate' | 'merch';

export interface SettingDef {
  /** Clave estable que se guarda en la base de datos. */
  key: string;
  /** Variable de entorno usada como fallback (y para migrar lo ya cargado). */
  envKey?: string;
  group: SettingGroup;
  /** Etiqueta que ve el admin. */
  label: string;
  /** Ayuda corta bajo el campo. */
  hint?: string;
}

export const SETTING_DEFS: SettingDef[] = [
  {
    key: 'checkout.frida.monthly',
    envKey: 'NEXT_PUBLIC_CHECKOUT_FRIDA_MONTHLY',
    group: 'checkout',
    label: 'Frida — mensual',
    hint: 'Link de checkout (Stripe Payment Link, Paddle, Lemon Squeezy…).',
  },
  {
    key: 'checkout.frida.yearly',
    envKey: 'NEXT_PUBLIC_CHECKOUT_FRIDA_YEARLY',
    group: 'checkout',
    label: 'Frida — anual',
  },
  {
    key: 'checkout.davinci.monthly',
    envKey: 'NEXT_PUBLIC_CHECKOUT_DAVINCI_MONTHLY',
    group: 'checkout',
    label: 'Da Vinci — mensual',
  },
  {
    key: 'checkout.davinci.yearly',
    envKey: 'NEXT_PUBLIC_CHECKOUT_DAVINCI_YEARLY',
    group: 'checkout',
    label: 'Da Vinci — anual',
  },
  {
    key: 'donate.url',
    envKey: 'NEXT_PUBLIC_DONATE_URL',
    group: 'donate',
    label: 'Mecenas — link de donación',
    hint: 'PayPal.me, Buy Me a Coffee, Ko-fi…',
  },
  {
    key: 'merch.tshirt.url',
    envKey: 'NEXT_PUBLIC_MERCH_TSHIRT_URL',
    group: 'merch',
    label: 'Print Shop — playera',
  },
  {
    key: 'merch.mug.url',
    envKey: 'NEXT_PUBLIC_MERCH_MUG_URL',
    group: 'merch',
    label: 'Print Shop — taza',
  },
  {
    key: 'merch.poster.url',
    envKey: 'NEXT_PUBLIC_MERCH_POSTER_URL',
    group: 'merch',
    label: 'Print Shop — póster',
  },
  {
    key: 'merch.partner.url',
    envKey: 'NEXT_PUBLIC_MERCH_PARTNER_URL',
    group: 'merch',
    label: 'Print Shop — link genérico (fallback)',
    hint: 'Se usa cuando un producto no tiene link propio.',
  },
];

const DEFS_BY_KEY = new Map(SETTING_DEFS.map((d) => [d.key, d]));

export const SETTING_KEYS = {
  fridaMonthly: 'checkout.frida.monthly',
  fridaYearly: 'checkout.frida.yearly',
  davinciMonthly: 'checkout.davinci.monthly',
  davinciYearly: 'checkout.davinci.yearly',
  donate: 'donate.url',
  merchTshirt: 'merch.tshirt.url',
  merchMug: 'merch.mug.url',
  merchPoster: 'merch.poster.url',
  merchPartner: 'merch.partner.url',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export type SettingSource = 'db' | 'env' | 'none';

export interface EffectiveSetting {
  key: string;
  value: string | null;
  source: SettingSource;
  envKey?: string;
  fromEnv: string | null;
}

/** Fila lista para pintar en el panel de admin (serializable). */
export interface AdminSettingField {
  key: string;
  group: SettingGroup;
  label: string;
  hint?: string;
  envKey?: string;
  /** Valor efectivo actual (panel o .env). */
  value: string;
  source: SettingSource;
  /** Valor que provee `.env` (para mostrar como placeholder). */
  fromEnv: string | null;
}

function readEnv(envKey?: string): string | null {
  if (!envKey) return null;
  const value = process.env[envKey];
  return value && value.trim().length > 0 ? value.trim() : null;
}

/** Valores guardados en la base de datos (solo los no vacíos). */
export async function getSettingsMap(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (row.value && row.value.trim().length > 0) {
      map[row.key] = row.value.trim();
    }
  }
  return map;
}

/** Resuelve el valor efectivo de una clave: DB primero, luego .env. */
export function resolveKey(key: string, db: Record<string, string>): string | null {
  const fromDb = db[key];
  if (fromDb && fromDb.trim().length > 0) return fromDb.trim();
  return readEnv(DEFS_BY_KEY.get(key)?.envKey);
}

/** Vista detallada para el panel de admin: valor, origen y fallback de .env. */
export async function getEffectiveSettings(): Promise<EffectiveSetting[]> {
  const db = await getSettingsMap();
  return SETTING_DEFS.map((def) => {
    const fromDb = db[def.key] ?? null;
    const fromEnv = readEnv(def.envKey);
    const source: SettingSource = fromDb ? 'db' : fromEnv ? 'env' : 'none';
    return {
      key: def.key,
      value: fromDb ?? fromEnv,
      source,
      envKey: def.envKey,
      fromEnv,
    };
  });
}

/** Campos listos para el formulario del panel de admin. */
export async function getAdminSettings(): Promise<AdminSettingField[]> {
  const db = await getSettingsMap();
  return SETTING_DEFS.map((def) => {
    const fromDb = db[def.key] ?? null;
    const fromEnv = readEnv(def.envKey);
    const source: SettingSource = fromDb ? 'db' : fromEnv ? 'env' : 'none';
    return {
      key: def.key,
      group: def.group,
      label: def.label,
      hint: def.hint,
      envKey: def.envKey,
      value: fromDb ?? fromEnv ?? '',
      source,
      fromEnv,
    };
  });
}

/**
 * Guarda los valores enviados desde el panel. Solo acepta claves conocidas.
 * Un valor vacío elimina la fila (vuelve al valor de `.env`, si existe).
 */
export async function saveSettings(values: Record<string, unknown>): Promise<string[]> {
  const saved: string[] = [];
  for (const def of SETTING_DEFS) {
    if (!(def.key in values)) continue;
    const raw = values[def.key];
    const value = typeof raw === 'string' ? raw.trim() : '';

    if (value.length === 0) {
      await prisma.setting.deleteMany({ where: { key: def.key } });
    } else {
      await prisma.setting.upsert({
        where: { key: def.key },
        create: { key: def.key, value },
        update: { value },
      });
    }
    saved.push(def.key);
  }
  return saved;
}
