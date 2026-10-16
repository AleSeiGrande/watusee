import { headers } from 'next/headers';
import { getSiteUrl } from './site';

/**
 * URL base real de la petición. Prefiere el host de la request (detrás de
 * proxies usa `x-forwarded-host` / `x-forwarded-proto`) y cae a la config
 * por entorno (`NEXT_PUBLIC_SITE_URL` / `AUTH_URL`).
 *
 * Solo para servidor: importa `next/headers`.
 */
export async function getRequestSiteUrl(): Promise<string> {
  const fallback = getSiteUrl();

  try {
    const h = await headers();
    const host = (h.get('x-forwarded-host') ?? h.get('host'))?.split(',')[0]?.trim();
    if (!host) return fallback;

    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host);
    const proto =
      h.get('x-forwarded-proto')?.split(',')[0]?.trim() || (isLocal ? 'http' : 'https');

    return `${proto}://${host}`;
  } catch {
    return fallback;
  }
}
