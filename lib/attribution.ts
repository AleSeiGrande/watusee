// ============================================================================
// Atribución UTM (first-touch)
// ----------------------------------------------------------------------------
// El tráfico de TikTok / redes llega con `?utm_source=…&utm_campaign=…`. El
// primer toque se guarda en `localStorage` + cookie y luego se envía al
// registrarse, para saber de dónde viene cada usuario.
//
// Este módulo es seguro de importar en cliente y servidor: las funciones que
// usan `window`/`localStorage` chequean el entorno.
// ============================================================================

export const ATTRIBUTION_STORAGE_KEY = 'watusee:attribution';
export const ATTRIBUTION_COOKIE = 'watusee_attr';
export const ATTRIBUTION_MAX_AGE_DAYS = 90;
const MAX_VALUE_LENGTH = 120;
const MAX_SERIALIZED_LENGTH = 500;

export interface Attribution {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  ref?: string;
  landing?: string;
  referrer?: string;
  at?: string;
}

const PARAM_MAP: Record<string, keyof Attribution> = {
  utm_source: 'source',
  utm_medium: 'medium',
  utm_campaign: 'campaign',
  utm_content: 'content',
  utm_term: 'term',
  ref: 'ref',
};

function clean(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, MAX_VALUE_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/** Detecta si el referrer es externo (no del propio sitio). */
function externalReferrer(): string | undefined {
  if (!isBrowser() || !document.referrer) return undefined;
  try {
    const ref = new URL(document.referrer);
    if (ref.origin === window.location.origin) return undefined;
    return clean(ref.host + ref.pathname);
  } catch {
    return undefined;
  }
}

/** Lee la atribución guardada (localStorage primero, cookie como fallback). */
export function readAttribution(): Attribution | null {
  if (!isBrowser()) return null;

  const stored = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Attribution;
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      /* ignorar JSON corrupto */
    }
  }

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${ATTRIBUTION_COOKIE}=`));
  if (cookie) {
    try {
      const value = decodeURIComponent(cookie.split('=').slice(1).join('='));
      const parsed = JSON.parse(value) as Attribution;
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      /* ignorar cookie corrupta */
    }
  }

  return null;
}

function persist(attribution: Attribution): void {
  try {
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    /* modo privado / storage lleno */
  }
  try {
    const maxAge = ATTRIBUTION_MAX_AGE_DAYS * 24 * 60 * 60;
    document.cookie = `${ATTRIBUTION_COOKIE}=${encodeURIComponent(
      JSON.stringify(attribution)
    )}; max-age=${maxAge}; path=/; samesite=lax`;
  } catch {
    /* cookies deshabilitadas */
  }
}

/**
 * Guarda el primer toque. Si ya existe una atribución previa, no la pisa
 * (first-touch), salvo que la nueva traiga UTM explícitos y la previa no.
 */
export function captureAttribution(): Attribution | null {
  if (!isBrowser()) return null;

  const params = new URLSearchParams(window.location.search);
  const incoming: Attribution = {};
  for (const [param, key] of Object.entries(PARAM_MAP)) {
    const value = clean(params.get(param));
    if (value) incoming[key] = value;
  }
  const hasExplicit = Object.keys(incoming).length > 0;

  const existing = readAttribution();
  if (existing && !(hasExplicit && !existing.source && !existing.campaign)) {
    return existing;
  }

  const attribution: Attribution = {
    ...incoming,
    landing: clean(window.location.pathname) || '/',
    referrer: externalReferrer(),
    at: new Date().toISOString(),
  };

  persist(attribution);
  return attribution;
}

/**
 * Normaliza cualquier entrada a un JSON acotado, listo para guardar.
 * Devuelve `null` si no hay datos útiles. Seguro para usar en el servidor.
 */
export function sanitizeAttribution(input: unknown): string | null {
  if (!input || typeof input !== 'object') return null;

  const allowed: Array<keyof Attribution> = [
    'source',
    'medium',
    'campaign',
    'content',
    'term',
    'ref',
    'landing',
    'referrer',
    'at',
  ];

  const out: Attribution = {};
  const record = input as Record<string, unknown>;
  for (const key of allowed) {
    const value = clean(typeof record[key] === 'string' ? (record[key] as string) : undefined);
    if (value) out[key] = value;
  }

  if (Object.keys(out).length === 0) return null;

  const serialized = JSON.stringify(out);
  return serialized.length > MAX_SERIALIZED_LENGTH
    ? serialized.slice(0, MAX_SERIALIZED_LENGTH)
    : serialized;
}
