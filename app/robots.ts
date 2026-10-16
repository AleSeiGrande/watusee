import type { MetadataRoute } from 'next';
import { getRequestSiteUrl } from '@/lib/site-url';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getRequestSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          // Contenido tras login o con gate de plan.
          '/create',
          '/adults',
          '/merch',
          '/nft',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
