// ============================================================================
// Identidad y URL canónica del sitio
// ----------------------------------------------------------------------------
// Fuente única para `metadataBase`, Open Graph, `sitemap.xml` y `robots.txt`.
// Configurá el dominio de producción con NEXT_PUBLIC_SITE_URL (o AUTH_URL).
// Si no hay ninguna variable, se usa el dominio oficial como fallback.
// ============================================================================

export const SITE_NAME = 'WatUSee';
export const SITE_TAGLINE = 'See the Unseen';
export const SITE_DESCRIPTION =
  'A social network for Pareidolia creators. Discover and share the hidden shapes in the world.';
export const SITE_LOCALE = 'en_US';

const FALLBACK_URL = 'https://watusee.fun';

/**
 * URL base absoluta del sitio, sin barra final.
 * Prioridad: NEXT_PUBLIC_SITE_URL > AUTH_URL > NEXT_PUBLIC_APP_URL > dominio oficial.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    FALLBACK_URL;

  try {
    return new URL(raw).origin;
  } catch {
    return FALLBACK_URL;
  }
}

/** Ruta absoluta a partir de un path relativo (`/pricing` -> `https://…/pricing`). */
export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
