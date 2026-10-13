import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { applySubscription, isPaidPlan, normalizeInterval, revokeUserPlan } from '@/lib/billing';
import { readObject, readString, toDate } from '@/lib/webhooks/utils';

/**
 * Activación manual de planes desde el panel de admin.
 *   POST { username, action: 'activate'|'cancel', plan?, interval?, currentPeriodEnd? }
 * Útil para pruebas, cortesías o si todavía no hay webhooks configurados.
 */
export const POST = auth(async (req) => {
  const adminId = req.auth?.user?.id;
  if (!adminId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!(await isAdmin(adminId))) return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const body = readObject(parsed);

  const username = readString(body.username)?.trim();
  if (!username) return NextResponse.json({ error: 'Falta el usuario' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true },
  });
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  if (readString(body.action) === 'cancel') {
    await revokeUserPlan(user.id);
    return NextResponse.json({ ok: true, action: 'cancel', username: user.username });
  }

  const plan = body.plan;
  if (!isPaidPlan(plan)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
  }

  const result = await applySubscription({
    userId: user.id,
    plan,
    interval: normalizeInterval(body.interval),
    status: 'active',
    provider: 'manual',
    currentPeriodEnd: toDate(body.currentPeriodEnd),
    eventType: 'manual.activate',
  });

  return NextResponse.json({ ok: true, action: 'activate', username: user.username, ...result });
});
