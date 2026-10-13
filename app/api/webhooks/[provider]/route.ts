// ============================================================================
// Webhooks de pago  ->  POST /api/webhooks/<provider>
//   - /api/webhooks/stripe   (firma con STRIPE_WEBHOOK_SECRET)
//   - /api/webhooks/generic  (cabecera x-webhook-secret = GENERIC_WEBHOOK_SECRET)
//
// Ver `lib/webhooks/*` para el detalle de cada proveedor y el README para
// los pasos de configuración.
// ============================================================================

import { NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/webhooks/stripe';
import { handleGenericWebhook } from '@/lib/webhooks/generic';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const rawBody = await req.text();

  switch (provider) {
    case 'stripe':
      return handleStripeWebhook(req, rawBody);
    case 'generic':
      return handleGenericWebhook(req, rawBody);
    default:
      return NextResponse.json({ error: `proveedor desconocido: ${provider}` }, { status: 404 });
  }
}
