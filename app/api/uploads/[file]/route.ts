import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { resolveUploadFile, contentTypeFor } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

// GET /api/uploads/[file] — sirve los archivos subidos (posts, play, avatares)
// desde cualquier ubicación de disco donde existan (public y data persistente).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params;
    const full = await resolveUploadFile(file);
    if (!full) {
      return new NextResponse('Not found', { status: 404 });
    }
    const data = await fs.readFile(full);
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentTypeFor(full),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
