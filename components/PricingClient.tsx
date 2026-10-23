'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  Heart,
  ShieldCheck,
  Star,
  ArrowRight,
  BadgeCheck,
  Gem,
} from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import { encodeCheckoutRef } from '@/lib/billing-shared';
import type { BillingInterval, ResolvedPlan } from '@/lib/plans';

interface PricingClientProps {
  plans: ResolvedPlan[];
  isLoggedIn: boolean;
  currency: string;
  /** Identidad que se adjunta al checkout para que el webhook active el plan. */
  userId?: string | null;
  userEmail?: string | null;
}

function formatPrice(currency: string, value: number): string {
  return `${currency}${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

export default function PricingClient({ plans, isLoggedIn, currency, userId, userEmail }: PricingClientProps) {
  const t = useT();
  const [interval, setInterval] = useState<BillingInterval>('monthly');

  /**
   * true = hay planes de pago activos (con precio real y link de checkout).
   * Si todos los planes de pago están "en construcción" no se muestran ni el
   * selector mensual/anual ni la fila de confianza sobre el cobro.
   */
  const hasLivePrices = plans.some((p) => p.ctaKind === 'checkout' && !p.comingSoon);

  /**
   * Adjunta la identidad del usuario y el plan al link de checkout
   * (`client_reference_id`, que Stripe interpreta nativamente) para que el
   * webhook sepa a quién activarle el plan. Los proveedores que no lo entienden
   * simplemente ignoran el parámetro.
   */
  const withIdentity = (url: string, plan: ResolvedPlan): string => {
    if (!userId) return url;
    try {
      const target = new URL(url);
      target.searchParams.set('client_reference_id', encodeCheckoutRef(userId, plan.id, interval));
      if (userEmail) target.searchParams.set('prefilled_email', userEmail);
      return target.toString();
    } catch {
      return url;
    }
  };

  const hrefFor = (plan: ResolvedPlan): string => {
    if (plan.ctaKind === 'free') return isLoggedIn ? '/create' : '/register';
    if (plan.ctaKind === 'donate') return '/support';
    const link = plan.checkout[interval];
    return link ? withIdentity(link, plan) : '/contact';
  };

  const isExternal = (href: string) => /^https?:\/\//.test(href);

  const isUnavailable = (plan: ResolvedPlan): boolean => {
    if (plan.ctaKind === 'checkout') return !plan.checkout[interval];
    return false;
  };

  const yearSaving = (plan: ResolvedPlan): number | null => {
    if (plan.priceMonthly == null || plan.priceYearly == null) return null;
    const full = plan.priceMonthly * 12;
    if (full <= 0) return null;
    return Math.round(((full - plan.priceYearly) / full) * 100);
  };

  const ctaLabel = (plan: ResolvedPlan): string => {
    if (plan.ctaKind === 'free') return t('pricing.cta.free');
    if (plan.ctaKind === 'donate') return t('pricing.cta.donate');
    return t('pricing.cta.checkout', { plan: plan.name });
  };

  const ctaClass = (plan: ResolvedPlan): string => {
    const base =
      'w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-all hover-lift';
    if (plan.highlight) return `${base} bg-brand-primary text-white hover:bg-brand-primary/90`;
    if (plan.ctaKind === 'donate')
      return `${base} bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/40 hover:bg-brand-secondary/25`;
    return `${base} bg-dark-surface text-white border border-dark-glass-border hover:bg-brand-primary hover:border-brand-primary`;
  };

  return (
    <div className="relative min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="w-[720px] h-[720px] rounded-full bg-brand-primary/10 blur-[140px]" />
        <div className="absolute top-40 left-1/4 w-[380px] h-[380px] rounded-full bg-brand-secondary/10 blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mb-6">
            <Sparkles className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
              {t('pricing.badge')}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            {t('pricing.title')}
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('pricing.subtitle')}
          </p>

          {/* Billing toggle */}
          {hasLivePrices && (
            <div className="inline-flex items-center gap-1 mt-8 p-1 rounded-full glass-panel">
              <button
                onClick={() => setInterval('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  interval === 'monthly' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('pricing.monthly')}
              </button>
              <button
                onClick={() => setInterval('yearly')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  interval === 'yearly' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('pricing.yearly')}
                <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent">
                  {t('pricing.yearlyBadge')}
                </span>
              </button>
            </div>
          )}
        </header>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 lg:items-start">
          {plans.map((plan) => {
            const saving = interval === 'yearly' ? yearSaving(plan) : null;
            const unavailable = isUnavailable(plan);
            const href = hrefFor(plan);
            const external = isExternal(href);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl p-6 sm:p-7 h-full transition-all ${
                  plan.highlight
                    ? 'glass-panel border-2 border-brand-primary/60 lg:scale-[1.03] shadow-[0_20px_60px_-25px_rgba(107,78,255,0.7)]'
                    : 'glass-panel border border-dark-glass-border hover:border-brand-primary/30'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-primary text-white text-[11px] font-bold uppercase tracking-wide shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    {t(`pricing.${plan.id}.badge`)}
                  </span>
                )}

                {/* Plan identity */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    {plan.ctaKind === 'donate' ? (
                      <Heart className="w-5 h-5 text-brand-secondary" />
                    ) : (
                      <BadgeCheck className={`w-5 h-5 ${plan.highlight ? 'text-brand-primary' : 'text-brand-accent'}`} />
                    )}
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      {t(`pricing.${plan.id}.tier`)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{plan.name}</h2>
                  <p className="text-gray-400 text-sm mt-1.5 min-h-[2.5rem] leading-relaxed">
                    {t(`pricing.${plan.id}.tagline`)}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6 min-h-[64px]">
                  {plan.comingSoon ? (
                    <div>
                      <span className="text-4xl font-bold text-white">$$$</span>
                      <p className="text-xs text-brand-accent mt-2 font-semibold uppercase tracking-wide">
                        {t('pricing.comingSoon')}
                      </p>
                    </div>
                  ) : plan.ctaKind === 'free' ? (
                    <span className="text-4xl font-bold text-white">{t('pricing.free')}</span>
                  ) : plan.ctaKind === 'donate' ? (
                    <span className="text-2xl font-bold text-white">{t('pricing.custom')}</span>
                  ) : (
                    <div className="flex items-end gap-1.5">
                      <span className="text-4xl font-bold text-white">
                        {formatPrice(currency, interval === 'yearly' ? plan.priceYearly! : plan.priceMonthly!)}
                      </span>
                      <span className="text-gray-400 text-sm mb-1">
                        {interval === 'yearly' ? t('pricing.perYear') : t('pricing.perMonth')}
                      </span>
                    </div>
                  )}
                  {saving !== null && !plan.comingSoon && (
                    <p className="text-xs text-brand-accent mt-2 font-medium">
                      {t('pricing.saveYear', { percent: String(saving) })}
                    </p>
                  )}
                </div>

                {/* CTA */}
                {plan.comingSoon ? (
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-white/5 text-gray-400 border border-dark-glass-border cursor-not-allowed"
                  >
                    {t('pricing.cta.soon')}
                  </button>
                ) : external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={ctaClass(plan)}>
                    {ctaLabel(plan)}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link href={href} className={ctaClass(plan)}>
                    {ctaLabel(plan)}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {!plan.comingSoon && unavailable && plan.ctaKind !== 'free' && (
                  <p className="text-[11px] text-gray-500 text-center mt-2">{t('pricing.checkoutSoon')}</p>
                )}

                {plan.id === 'davinci' && (
                  <Link
                    href="/nft"
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-accent/10 text-brand-accent border border-brand-accent/40 hover:bg-brand-accent/20 text-xs font-semibold transition-colors"
                  >
                    <Gem className="w-3.5 h-3.5" />
                    {t('pricing.davinci.nftCta')}
                    <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent">
                      {t('nft.soon')}
                    </span>
                  </Link>
                )}

                {/* Features */}
                <ul className="mt-7 flex flex-col gap-3">
                  {plan.featureKeys.map((key) => (
                    <li key={key} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <Check
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          plan.ctaKind === 'donate' ? 'text-brand-secondary' : 'text-brand-accent'
                        }`}
                      />
                      <span className="leading-relaxed">{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 text-sm text-gray-500">
          {hasLivePrices && (
            <>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-accent" />
                {t('pricing.trust.secure')}
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-brand-accent" />
                {t('pricing.trust.cancel')}
              </span>
            </>
          )}
          <span className="inline-flex items-center gap-2">
            <Heart className="w-4 h-4 text-brand-secondary" />
            {t('pricing.trust.support')}
          </span>
        </div>
        {hasLivePrices && (
          <p className="text-center text-xs text-gray-600 mt-4">
            {t('pricing.vatNote', { currency })}
          </p>
        )}

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
            {t('pricing.faq.title')}
          </h2>
          <div className="flex flex-col gap-3">
            {(hasLivePrices ? [1, 2, 3, 4] : [4]).map((n) => (
              <details
                key={n}
                className="glass-panel rounded-2xl border border-dark-glass-border px-5 sm:px-6 py-4 group"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-white font-semibold text-sm sm:text-base">
                  {t(`pricing.faq.q${n}`)}
                  <ArrowRight className="w-4 h-4 text-brand-accent transition-transform group-open:rotate-90 flex-shrink-0" />
                </summary>
                <p className="text-gray-400 text-sm leading-relaxed mt-3">{t(`pricing.faq.a${n}`)}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center mt-20">
          <p className="text-white text-xl sm:text-2xl font-bold mb-6">{t('pricing.finalCta')}</p>
          <Link
            href={isLoggedIn ? '/create' : '/register'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold transition-all hover-lift"
          >
            {isLoggedIn ? t('pricing.finalCtaLogged') : t('pricing.finalCtaGuest')}
            <Sparkles className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
