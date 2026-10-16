'use client';

import Script from 'next/script';
import type { AnalyticsConfig } from '@/lib/settings';

// Solo se permite 1 proveedor activo por simplicidad, pero soportamos los tres
// más comunes. La config viene del panel /admin (prioridad) o de .env.
function sanitizeId(value: string | null): string | null {
  if (!value) return null;
  const clean = value.replace(/[^A-Za-z0-9_-]/g, '');
  return clean.length > 0 ? clean : null;
}

export default function Analytics({ config }: { config: AnalyticsConfig }) {
  const ga4Id = sanitizeId(config.ga4Id);
  const plausibleDomain = config.plausibleDomain?.trim() || null;
  const umamiSrc = config.umamiSrc?.trim() || null;
  const umamiWebsiteId = config.umamiWebsiteId?.trim() || null;

  if (!ga4Id && !plausibleDomain && !(umamiSrc && umamiWebsiteId)) return null;

  return (
    <>
      {ga4Id ? (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`}
          </Script>
        </>
      ) : null}

      {plausibleDomain ? (
        <Script
          id="plausible"
          strategy="afterInteractive"
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
        />
      ) : null}

      {umamiSrc && umamiWebsiteId ? (
        <Script
          id="umami"
          strategy="afterInteractive"
          defer
          data-website-id={umamiWebsiteId}
          src={umamiSrc}
        />
      ) : null}
    </>
  );
}
