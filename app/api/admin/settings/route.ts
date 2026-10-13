import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/admin';
import { getAdminSettings, saveSettings } from '@/lib/settings';

/**
 * Configuración del panel de admin.
 *   GET  -> devuelve los campos con su valor efectivo.
 *   POST -> guarda { values: { [key]: string } }. Un valor vacío borra la fila
 *           y hace que se use la variable de entorno (si existe).
 * Solo accesible para usuarios con `isAdmin = true`.
 */

async function ensureAdmin(userId?: string | null) {
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
  }
  return null;
}

export const GET = auth(async (req) => {
  const denied = await ensureAdmin(req.auth?.user?.id);
  if (denied) return denied;

  const settings = await getAdminSettings();
  return NextResponse.json({ settings });
});

export const POST = auth(async (req) => {
  const denied = await ensureAdmin(req.auth?.user?.id);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const values =
    body && typeof body === 'object' && 'values' in body
      ? (body as { values?: unknown }).values
      : null;

  if (!values || typeof values !== 'object') {
    return NextResponse.json({ error: 'Faltan valores' }, { status: 400 });
  }

  const saved = await saveSettings(values as Record<string, unknown>);
  const settings = await getAdminSettings();
  return NextResponse.json({ ok: true, saved, settings });
});
