import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';
import T from '@/components/T';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-dark-glass-border bg-dark-glass/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + support CTA */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="WatUSee" className="h-8 w-auto" />
              <span className="text-xl font-bold tracking-tighter text-gradient">WatUSee</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              <T id="footer.tagline" />
            </p>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/40 hover:bg-brand-secondary/25 transition-colors text-sm font-semibold"
            >
              <Heart className="w-4 h-4" />
              <T id="footer.support" />
            </Link>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">
              <T id="footer.explore" />
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li>
                <Link href="/play" className="hover:text-brand-accent transition-colors">
                  <T id="nav.games" />
                </Link>
              </li>
              <li>
                <Link href="/imaginarium" className="hover:text-brand-accent transition-colors">
                  <T id="nav.imaginarium" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-accent transition-colors">
                  <T id="about.nav" />
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-brand-accent transition-colors">
                  <T id="pricing.nav" />
                </Link>
              </li>
              <li>
                <Link href="/merch" className="hover:text-brand-accent transition-colors">
                  <T id="merch.nav" />
                </Link>
              </li>
              <li>
                <Link href="/nft" className="hover:text-brand-accent transition-colors">
                  <T id="nft.nav" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">
              <T id="footer.account" />
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li>
                <Link href="/create" className="hover:text-brand-accent transition-colors">
                  <T id="nav.create" />
                </Link>
              </li>
              <li>
                <Link href="/my-creations" className="hover:text-brand-accent transition-colors">
                  <T id="nav.mycreations" />
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-brand-secondary transition-colors">
                  <T id="support.nav" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-dark-glass-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>
            <T id="footer.rights" params={{ year: String(year) }} />
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            watusee.fun
          </span>
        </div>
      </div>
    </footer>
  );
}
