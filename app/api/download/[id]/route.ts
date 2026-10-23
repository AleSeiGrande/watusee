import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getEntitlements } from '@/lib/entitlements';
import { resolveUploadFile, contentTypeFor } from '@/lib/uploads';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Ancho máximo de la descarga gratuita (la de pago es el original a tamaño completo).
const FREE_MAX_WIDTH = 1080;
const WATERMARK = 'watdusee.fun';

function safeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'creation';
}

// GET /api/download/[id]?v=interpreted|original
// Requiere sesión (evita descargas masivas anónimas).
//  - Plan gratis: PNG reducido (máx. 1080px) con marca de agua.
//  - Frida / Da Vinci (feature download.hd): archivo original a resolución completa, sin marca.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const variant = searchParams.get('v') === 'original' ? 'original' : 'interpreted';

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, originalImage: true, interpretedImage: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const sourceUrl = variant === 'original' ? post.originalImage : post.interpretedImage;
    const filenameFromUrl = sourceUrl.split('/').pop() || '';
    // Las subidas viven en public/ o en el directorio de datos; los archivos semilla
    // (p. ej. /cloud_original.png o /play/x.jpg) viven directamente en public/.
    let full = await resolveUploadFile(filenameFromUrl);
    if (!full && sourceUrl.startsWith('/') && !sourceUrl.includes('..')) {
      const candidate = path.join(process.cwd(), 'public', ...sourceUrl.split('/').filter(Boolean));
      try {
        await fs.access(candidate);
        full = candidate;
      } catch {
        full = null;
      }
    }
    if (!full) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }

    const entitlements = await getEntitlements(session.user.id);
    const hd = entitlements.features.includes('download.hd');
    const baseName = `watdusee-${safeId(post.id)}`;

    // Plan de pago: sirve el archivo original tal cual, sin marca de agua.
    if (hd) {
      const data = await fs.readFile(full);
      const ext = full.slice(full.lastIndexOf('.')) || '.png';
      return new NextResponse(new Uint8Array(data), {
        status: 200,
        headers: {
          'Content-Type': contentTypeFor(full),
          'Content-Disposition': `attachment; filename="${baseName}-hd${ext}"`,
          'Cache-Control': 'private, no-store',
          'X-Watdusee-Watermarked': '0',
        },
      });
    }

    // Plan gratis: reduce y agrega marca de agua.
    const base = await sharp(full)
      .resize({ width: FREE_MAX_WIDTH, withoutEnlargement: true })
      .png()
      .toBuffer();

    const meta = await sharp(base).metadata();
    const w = meta.width ?? FREE_MAX_WIDTH;
    const h = meta.height ?? FREE_MAX_WIDTH;
    const fontSize = Math.max(18, Math.round(Math.min(w, h) * 0.05));
    const pad = Math.round(fontSize * 0.7);
    const watermark = Buffer.from(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <text x="${w - pad}" y="${h - pad}" font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}" font-weight="bold" fill="rgba(255,255,255,0.72)"
          stroke="rgba(0,0,0,0.35)" stroke-width="1.5" text-anchor="end">${WATERMARK}</text>
      </svg>`
    );

    const out = await sharp(base)
      .composite([{ input: watermark, top: 0, left: 0 }])
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(out), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${baseName}.png"`,
        'Cache-Control': 'private, no-store',
        'X-Watdusee-Watermarked': '1',
      },
    });
  } catch (err) {
    console.error('Download error:', err);
    return NextResponse.json({ error: 'Error al descargar' }, { status: 500 });
  }
}
