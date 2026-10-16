import type { MetadataRoute } from 'next';
import { getRequestSiteUrl } from '@/lib/site-url';

// Rutas públicas e indexables. Las páginas privadas (/admin), de cuenta
// (/login, /register, /forgot-password) y con gate de plan (/merch, /nft,
// /adults) quedan fuera del sitemap y bloqueadas en `robots.ts`.
const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/play', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/daily-challenge', changeFrequency: 'daily', priority: 0.9 },
  { path: '/echo', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/story', changeFrequency: 'daily', priority: 0.8 },
  { path: '/blind-blowup', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/mind-reader', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/puzzle-img', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/support', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/refund', changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getRequestSiteUrl();
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: route.path === '/' ? base : `${base}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
