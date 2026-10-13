import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Lock,
  LogIn,
  ArrowRight,
  Sparkles,
  HardHat,
  TrendingUp,
  Gem,
  Activity,
  Heart,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getEntitlements } from '@/lib/entitlements';
import { CURRENCY } from '@/lib/plans';
import T from '@/components/T';

export const metadata: Metadata = {
  title: 'NFT Gallery | WatUSee',
  description:
    'Your pareidolia creations as collectibles that earn prestige and value from visits, likes and community metrics. In development.',
};

export const dynamic = 'force-dynamic';

interface GateProps {
  icon: 'lock' | 'login';
  titleId: string;
  descId: string;
  ctaId: string;
  href: string;
}

function Gate({ icon, titleId, descId, ctaId, href }: GateProps) {
  const Icon = icon === 'lock' ? Lock : LogIn;
  return (
    <div className="relative min-h-screen bg-black pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-brand-accent/10 blur-[140px]" />
      </div>
      <div className="relative max-w-lg mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-panel border border-dark-glass-border mb-6">
          <Icon className="w-7 h-7 text-brand-accent" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          <T id={titleId} />
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          <T id={descId} />
        </p>
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold transition-all hover-lift"
        >
          <Sparkles className="w-4 h-4" />
          <T id={ctaId} />
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

interface CreationPreview {
  id: string;
  title: string;
  image: string;
  likes: number;
  shares: number;
  reactions: number;
  comments: number;
  remixes: number;
  prestige: number;
}

function tierFor(prestige: number): string {
  if (prestige < 10) return 'nft.tier.newbie';
  if (prestige < 50) return 'nft.tier.rising';
  if (prestige < 200) return 'nft.tier.known';
  if (prestige < 1000) return 'nft.tier.elite';
  return 'nft.tier.legend';
}

export default async function NftPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <Gate
        icon="login"
        titleId="nft.login.title"
        descId="nft.login.desc"
        ctaId="nft.login.cta"
        href="/login"
      />
    );
  }

  const entitlements = await getEntitlements(userId);
  if (!entitlements.features.includes('nft.prestige')) {
    return (
      <Gate
        icon="lock"
        titleId="nft.gate.title"
        descId="nft.gate.desc"
        ctaId="nft.gate.cta"
        href="/pricing"
      />
    );
  }

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    select: {
      id: true,
      title: true,
      interpretedImage: true,
      likes: true,
      sharesCount: true,
      _count: { select: { reactions: true, comments: true, remixes: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  const creations: CreationPreview[] = posts.map((post) => {
    const reactions = post._count.reactions;
    const comments = post._count.comments;
    const remixes = post._count.remixes;
    const prestige =
      post.likes * 2 + reactions * 3 + comments * 4 + post.sharesCount * 5 + remixes * 6;
    return {
      id: post.id,
      title: post.title,
      image: post.interpretedImage,
      likes: post.likes,
      shares: post.sharesCount,
      reactions,
      comments,
      remixes,
      prestige,
    };
  });

  const concepts = [
    { key: 'prestige', icon: TrendingUp, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { key: 'value', icon: Gem, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    { key: 'metrics', icon: Activity, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
  ];

  const metrics = [
    { key: 'visits', icon: Activity },
    { key: 'likes', icon: Heart },
    { key: 'reactions', icon: Sparkles },
    { key: 'comments', icon: MessageCircle },
    { key: 'shares', icon: ArrowRight },
    { key: 'remixes', icon: Gem },
  ];

  return (
    <div className="relative min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="w-[680px] h-[680px] rounded-full bg-brand-accent/10 blur-[150px]" />
        <div className="absolute top-40 left-1/4 w-[380px] h-[380px] rounded-full bg-brand-primary/10 blur-[130px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mb-6">
            <Gem className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
              <T id="nft.badge" />
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            <T id="nft.title" />
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            <T id="nft.subtitle" />
          </p>
        </header>

        {/* Under construction banner */}
        <div className="mb-14 rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center">
              <HardHat className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="text-lg font-bold text-amber-300">
                  <T id="nft.construction.title" />
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold uppercase tracking-wide">
                  <HardHat className="w-3 h-3" />
                  <T id="nft.soon" />
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                <T id="nft.construction.desc" />
              </p>
            </div>
          </div>
        </div>

        {/* Concept */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-16">
          {concepts.map(({ key, icon: Icon, color, bg }) => (
            <div
              key={key}
              className="glass-panel p-6 sm:p-7 rounded-2xl border border-dark-glass-border hover:border-brand-accent/30 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                <T id={`nft.concept.${key}.title`} />
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                <T id={`nft.concept.${key}.desc`} />
              </p>
            </div>
          ))}
        </section>

        {/* Preview grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              <T id="nft.preview.title" />
            </h2>
            <Link
              href="/my-creations"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <T id="nft.cta" />
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {creations.length === 0 ? (
            <div className="glass-panel rounded-3xl border border-dark-glass-border p-10 text-center">
              <Gem className="w-8 h-8 text-brand-accent/60 mx-auto mb-4" />
              <p className="text-gray-400 text-sm mb-5">
                <T id="nft.preview.empty" />
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm transition-all hover-lift"
              >
                <Sparkles className="w-4 h-4" />
                <T id="nav.create" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {creations.map((creation) => (
                <div
                  key={creation.id}
                  className="group relative rounded-2xl overflow-hidden glass-panel border border-dark-glass-border hover:border-brand-accent/40 transition-all"
                >
                  <div className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={creation.image}
                      alt={creation.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                    <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wide text-brand-accent">
                      <Gem className="w-3 h-3" />
                      <T id={tierFor(creation.prestige)} />
                    </span>
                    <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/80 text-[10px] font-bold uppercase tracking-wide text-black">
                      <HardHat className="w-3 h-3" />
                      <T id="nft.soon" />
                    </span>
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      <h3 className="text-white font-semibold text-sm truncate">
                        {creation.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="text-brand-primary font-semibold">
                          <T id="nft.prestige" /> {creation.prestige}
                        </span>
                        <span className="text-gray-300">
                          <T id="nft.value" />{' '}
                          <span className="text-white font-semibold">
                            {CURRENCY}
                            {(creation.prestige * 0.05).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-around gap-2 px-3 py-2.5 text-[11px] text-gray-400 border-t border-dark-glass-border">
                    <span className="inline-flex items-center gap-1" title="Likes">
                      <Heart className="w-3.5 h-3.5" />
                      {creation.likes}
                    </span>
                    <span className="inline-flex items-center gap-1" title="Reactions">
                      <Sparkles className="w-3.5 h-3.5" />
                      {creation.reactions}
                    </span>
                    <span className="inline-flex items-center gap-1" title="Comments">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {creation.comments}
                    </span>
                    <span className="inline-flex items-center gap-1" title="Remixes">
                      <Gem className="w-3.5 h-3.5" />
                      {creation.remixes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* How it works + Roadmap */}
        <section className="grid gap-6 lg:grid-cols-2 mb-16">
          <div className="glass-panel rounded-3xl border border-dark-glass-border p-7 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              <T id="nft.how.title" />
            </h2>
            <ol className="flex flex-col gap-4">
              {['1', '2', '3', '4'].map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-accent/15 text-brand-accent text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-gray-300 text-sm leading-relaxed pt-1">
                    <T id={`nft.how.${step}`} />
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="glass-panel rounded-3xl border border-dark-glass-border p-7 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              <T id="nft.roadmap.title" />
            </h2>
            <ul className="flex flex-col gap-4">
              {['1', '2', '3', '4'].map((step) => (
                <li key={step} className="flex items-start gap-3">
                  <Clock className="w-4 h-4 mt-1 flex-shrink-0 text-amber-400" />
                  <span className="text-gray-300 text-sm leading-relaxed">
                    <T id={`nft.roadmap.${step}`} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Metrics strip */}
        <section className="glass-panel rounded-3xl border border-dark-glass-border p-7 sm:p-8 mb-16">
          <h3 className="text-white font-bold mb-5 text-center">
            <T id="nft.concept.metrics.title" />
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {metrics.map(({ key, icon: Icon }) => (
              <span
                key={key}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-surface border border-dark-glass-border text-sm text-gray-300"
              >
                <Icon className="w-4 h-4 text-brand-accent" />
                <T id={`nft.metric.${key}`} />
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-white text-xl sm:text-2xl font-bold mb-6">
            <T id="nft.construction.title" />
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold transition-all hover-lift"
            >
              <Sparkles className="w-4 h-4" />
              <T id="nft.gate.cta" />
            </Link>
            <Link
              href="/my-creations"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-dark-surface border border-dark-glass-border text-white font-semibold transition-all hover-lift"
            >
              <T id="nft.cta" />
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
