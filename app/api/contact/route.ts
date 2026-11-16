import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Destinatarios configurables con CONTACT_TO (separados por comas).
    // Por defecto: tu Gmail + el buzón público hola@watdusee.fun
    const sent = await sendContactEmail(name.trim(), email.trim(), message.trim());

    if (!sent) {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Contact] Failed to send email:', err?.message || err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
