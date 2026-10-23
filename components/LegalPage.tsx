'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ScrollText, CalendarClock } from 'lucide-react';
import { useLang } from '@/lib/i18n/context';
import { LEGAL_DOCS, LEGAL_CONTACT_EMAIL, type LegalDocId } from '@/lib/legal';

/** Convierte el email de contacto en un enlace mailto dentro del texto. */
function withEmail(text: string): ReactNode {
  const parts = text.split(LEGAL_CONTACT_EMAIL);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <span key={i}>
      {i > 0 && (
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-brand-primary hover:underline">
          {LEGAL_CONTACT_EMAIL}
        </a>
      )}
      {part}
    </span>
  ));
}

const NAV_LABELS: Record<'en' | 'es', Record<LegalDocId, string>> = {
  en: { terms: 'Terms', privacy: 'Privacy', refund: 'Refund' },
  es: { terms: 'Términos', privacy: 'Privacidad', refund: 'Reembolsos' },
};

export default function LegalPage({ doc }: { doc: LegalDocId }) {
  const { lang } = useLang();
  const code = lang === 'ES' ? 'es' : 'en';
  const data = LEGAL_DOCS[doc][code] ?? LEGAL_DOCS[doc].en;
  const nav = NAV_LABELS[code];

  return (
    <div className="relative min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="w-[620px] h-[620px] rounded-full bg-brand-primary/10 blur-[140px]" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          WatDuSee
        </Link>

        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mb-6">
            <ScrollText className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
              Legal
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            {data.title}
          </h1>
          <p className="inline-flex items-center gap-2 text-sm text-gray-500">
            <CalendarClock className="w-4 h-4" />
            {data.updated}
          </p>
        </header>

        <p className="text-gray-300 text-lg leading-relaxed mb-10">{data.intro}</p>

        <div className="space-y-8">
          {data.sections.map((section) => (
            <section key={section.heading} className="glass-panel rounded-2xl p-6 sm:p-7">
              <h2 className="text-xl font-semibold text-white mb-3">{section.heading}</h2>
              <div className="space-y-3">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-gray-400 leading-relaxed">
                    {withEmail(paragraph)}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <nav className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-white transition-colors">
            {nav.terms}
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            {nav.privacy}
          </Link>
          <Link href="/refund" className="hover:text-white transition-colors">
            {nav.refund}
          </Link>
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="hover:text-white transition-colors">
            {LEGAL_CONTACT_EMAIL}
          </a>
        </nav>
      </div>
    </div>
  );
}
