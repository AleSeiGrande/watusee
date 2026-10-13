// ============================================================================
// Permisos de administrador
// ----------------------------------------------------------------------------
// El panel /admin (configuración de pagos, merch, etc.) solo está disponible
// para usuarios con `User.isAdmin = true`.
// ----------------------------------------------------------------------------

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/** ¿El usuario es administrador? */
export async function isAdmin(userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });
  return Boolean(user?.isAdmin);
}

/** Devuelve el id del admin si la sesión actual lo es; si no, `null`. */
export async function getAdminUserId(): Promise<string | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return (await isAdmin(userId)) ? userId : null;
}
