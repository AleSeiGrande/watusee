import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Server, ShieldCheck, Sparkles, ArrowRight, Check } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getPlans } from '@/lib/plans';
import T from '@/components/T';

export const metadata: Metadata = {
  title: 'Apoyar a WatUSee | Mecenas',
  description:
    'Apoyá a WatUSee con una contribución voluntaria y ayudá a mantener viva la comunidad de creadores de pareidolia.',
};

export const dynamic = 'force-dynamic';

const MECENAS_PERKS = [
  'pricing.mecenas.f1',
  'pricing.mecenas.f2',
  'pricing.mecenas.f3',
  'pricing.mecenas.f4',
];

export default async function SupportPage() {
  const mecenas = (await getPlans()).find((plan) => plan.id === 'mecenas');
  const donateUrl = mecenas?.donateUrl ?? null;

  const patrons = await prisma.user.findMany({
    where: { isPatron: true },
    select: { id: true, username: true, image: true },
    orderBy: { createdAt: 'asc' },
    take: 60,
  });

  const reasons = [
    { key: '1', icon: Server, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { key: '2', icon: ShieldCheck, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    { key: '3', icon: Sparkles, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
  ];

  return (
    <div className="relative min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="w-[680px] h-[680px] rounded-full bg-brand-secondary/10 blur-[140px]" />
        <div className="absolute top-32 right-1/4 w-[360px] h-[360px] rounded-full bg-brand-primary/10 blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Hero */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mb-6">
            <Heart className="w-4 h-4 text-brand-secondary" />
            <span className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
              <T id="support.badge" />
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            <T id="support.title" />
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            <T id="support.subtitle" />
          </p>
        </header>

        {/* Why */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-16">
          {reasons.map(({ key, icon: Icon, color, bg }) => (
            <div
              key={key}
              className="glass-panel p-6 sm:p-7 rounded-2xl border border-dark-glass-border hover:border-brand-secondary/30 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                <T id={`support.why${key}.title`} />
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                <T id={`support.why${key}.desc`} />
              </p>
            </div>
          ))}
        </section>

        {/* Perks + CTA */}
        <section className="glass-panel rounded-3xl border border-dark-glass-border p-8 sm:p-10 mb-16">
          <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-5">
                <T id="support.perks.title" />
              </h2>
              <ul className="flex flex-col gap-3">
                {MECENAS_PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-secondary" />
                    <span className="leading-relaxed">
                      <T id={perk} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-stretch sm:items-center gap-3">
              {donateUrl ? (
                <a
                  href={donateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold transition-all hover-lift"
                >
                  <Heart className="w-4 h-4" />
                  <T id="support.cta" />
                </a>
              ) : (
                <>
                  <button
                    disabled
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-dark-surface text-gray-500 border border-dark-glass-border font-bold cursor-not-allowed"
                  >
                    <Heart className="w-4 h-4" />
                    <T id="support.cta" />
                  </button>
                  <p className="text-xs text-gray-500 text-center max-w-xs">
                    <T id="support.ctaSoon" />
                  </p>
                </>
              )}
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-1"
              >
                <T id="support.plans" />
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Thanks to patrons */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
            <T id="support.thanks.title" />
          </h2>
          {patrons.length > 0 && (
            <p className="text-center text-sm text-brand-secondary mb-8">
              <T id="support.thanks.count" params={{ count: String(patrons.length) }} />
            </p>
          )}

          {patrons.length === 0 ? (
            <div className="glass-panel rounded-3xl border border-dark-glass-border p-10 text-center">
              <Heart className="w-8 h-8 text-brand-secondary/60 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">
                <T id="support.thanks.empty" />
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {patrons.map((patron) => (
                <div key={patron.id} className="flex flex-col items-center gap-2 w-20">
                  {patron.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={patron.image}
                      alt={patron.username}
                      className="h-14 w-14 rounded-full object-cover border-2 border-brand-secondary/40"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-brand-secondary/20 border-2 border-brand-secondary/40 flex items-center justify-center text-brand-secondary font-bold text-lg">
                      {patron.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-gray-400 truncate max-w-full">
                    {patron.username}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
