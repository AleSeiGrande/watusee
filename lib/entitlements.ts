import { prisma } from '@/lib/prisma';

/**
 * Features que se pueden desbloquear según el plan.
 * Agregá acá las nuevas y usalas con `userHasFeature()` o `planHasFeature()`.
 */
export type Feature =
  | 'puzzle.dual'
  | 'download.hd'
  | 'story.more_images'
  | 'echo.pro'
  | 'analytics.advanced'
  | 'ads.free'
  | 'merch.print'
  | 'nft.prestige';

/**
 * Mapa plan -> features. Es el espejo en código de lo que promete la página
 * de precios (`lib/plans.ts`). Si cambiás un plan, actualizá ambos lados.
 */
const PLAN_FEATURES: Record<string, Feature[]> = {
  banksy: [],
  frida: ['download.hd', 'story.more_images', 'merch.print'],
  davinci: ['download.hd', 'story.more_images', 'echo.pro', 'puzzle.dual', 'analytics.advanced', 'ads.free', 'merch.print', 'nft.prestige'],
  mecenas: [],
};

const FREE_PLAN = 'banksy';

export function featuresForPlan(plan: string | null | undefined): Feature[] {
  if (!plan) return [];
  return PLAN_FEATURES[plan] ?? [];
}

export function planHasFeature(plan: string | null | undefined, feature: Feature): boolean {
  return featuresForPlan(plan).includes(feature);
}

export interface UserEntitlements {
  plan: string;
  status: string;
  isPatron: boolean;
  isActive: boolean;
  features: Feature[];
}

/**
 * Devuelve los permisos del usuario. Un usuario anónimo o inexistente se trata
 * como plan gratuito. Si la suscripción no está activa, no se otorgan features.
 */
export async function getEntitlements(userId: string | null | undefined): Promise<UserEntitlements> {
  const anonymous: UserEntitlements = {
    plan: FREE_PLAN,
    status: 'active',
    isPatron: false,
    isActive: true,
    features: [],
  };

  if (!userId) return anonymous;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planStatus: true, isPatron: true },
  });

  if (!user) return anonymous;

  const isActive = user.planStatus === 'active';

  return {
    plan: user.plan,
    status: user.planStatus,
    isPatron: user.isPatron,
    isActive,
    features: isActive ? featuresForPlan(user.plan) : [],
  };
}

export async function userHasFeature(
  userId: string | null | undefined,
  feature: Feature,
): Promise<boolean> {
  const entitlements = await getEntitlements(userId);
  return entitlements.features.includes(feature);
}
