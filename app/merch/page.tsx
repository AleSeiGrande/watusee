import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, LogIn, ArrowRight, Sparkles } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getEntitlements } from '@/lib/entitlements';
import { getMerchProducts } from '@/lib/merch';
import { CURRENCY } from '@/lib/plans';
import T from '@/components/T';
import MerchClient from '@/components/MerchClient';

export const metadata: Metadata = {
  title: 'Print Shop | WatUSee',
  description:
    'Turn your pareidolia into a t-shirt, a mug or a poster. A plus for Frida and Da Vinci members.',
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
        <div className="w-[600px] h-[600px] rounded-full bg-brand-primary/10 blur-[140px]" />
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

export default async function MerchPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <Gate
        icon="login"
        titleId="merch.login.title"
        descId="merch.login.desc"
        ctaId="merch.login.cta"
        href="/login"
      />
    );
  }

  const entitlements = await getEntitlements(userId);
  if (!entitlements.features.includes('merch.print')) {
    return (
      <Gate
        icon="lock"
        titleId="merch.gate.title"
        descId="merch.gate.desc"
        ctaId="merch.gate.cta"
        href="/pricing"
      />
    );
  }

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    select: { id: true, title: true, interpretedImage: true },
    orderBy: { createdAt: 'desc' },
    take: 60,
  });

  const creations = posts.map((post) => ({
    id: post.id,
    title: post.title,
    image: post.interpretedImage,
  }));

  return <MerchClient creations={creations} products={getMerchProducts()} currency={CURRENCY} />;
}
