import { NextResponse } from 'next/server';
import { getEmailConfig, verifyEmailTransport } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/diagnostico-correo
// Comprueba la configuración SMTP y si el servidor acepta el login.
// No envía ningún correo y nunca devuelve la contraseña.
export async function GET() {
  const config = getEmailConfig();
  const verify = await verifyEmailTransport();

  return NextResponse.json({
    // Solo se muestra en parte el usuario, nunca la contraseña.
    user: config.user
      ? config.user.replace(/^(.{2}).*(@.*)$/, '$1***$2')
      : '(vacío)',
    host: config.host,
    port: config.port,
    secure: config.secure,
    hasUser: config.hasUser,
    hasPass: config.hasPass,
    from: config.from,
    authUrl: config.authUrl,
    login: verify.ok ? 'OK' : 'FALLA',
    error: verify.error ?? null,
  });
}
