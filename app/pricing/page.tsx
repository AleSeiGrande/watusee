import type { Metadata } from 'next';
import { auth } from '@/auth';
import { getPlans, CURRENCY } from '@/lib/plans';
import PricingClient from '@/components/PricingClient';

export const metadata: Metadata = {
  title: 'Planes y precios | WatUSee',
  description:
    'Elegí tu plan en WatUSee. Empezá gratis con Banksy, crecé con Frida o Da Vinci, o apoyá el proyecto como Mecenas.',
};

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const session = await auth();
  const plans = getPlans();

  return (
    <PricingClient plans={plans} isLoggedIn={Boolean(session?.user)} currency={CURRENCY} />
  );
}
