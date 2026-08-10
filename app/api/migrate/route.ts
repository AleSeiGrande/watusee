import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// One-off: rewrite stored image URLs from /uploads/... and /play/uploads/...
// to /api/uploads/... so images are served by the Next.js route handler
// instead of LiteSpeed's (stale) static document root.

const FIELDS: Array<[string, string[]]> = [
  ['post', ['originalImage', 'interpretedImage']],
  ['playImage', ['imageUrl']],
  ['user', ['image']],
  ['storyImage', ['imageUrl']],
  ['dailyPareidolia', ['imageUrl']],
  ['resonanceSignal', ['imageUrl']],
  ['echoDrawing', ['imageUrl']],
  ['dailyEcho', ['imageUrl']],
  ['blindBlowupGame', ['imageUrl']],
  ['mindReaderRound', ['image0', 'image1', 'image2']],
];

type Row = { id: string } & Record<string, unknown>;

type Delegate = {
  findMany: (args: { select: Record<string, boolean> }) => Promise<Row[]>;
  update: (args: { where: { id: string }; data: Record<string, string> }) => Promise<unknown>;
};

function rewrite(url: string): string {
  if (url.startsWith('/api/uploads/')) return url;
  const match = url.match(/^\/(?:uploads|play\/uploads)\/(?:adults\/)?([^/]+)$/);
  if (match) return `/api/uploads/${match[1]}`;
  return url;
}

export async function GET() {
  let updated = 0;
  const perModel: Record<string, number> = {};
  for (const [model, fields] of FIELDS) {
    const delegate = (prisma as unknown as Record<string, Delegate>)[model];
    if (!delegate) continue;
    const rows = await delegate.findMany({
      select: Object.fromEntries(fields.map((f) => [f, true])),
    });
    let n = 0;
    for (const row of rows) {
      const data: Record<string, string> = {};
      let changed = false;
      for (const f of fields) {
        const val: unknown = row[f];
        if (typeof val === 'string') {
          const nv = rewrite(val);
          if (nv !== val) {
            data[f] = nv;
            changed = true;
          }
        }
      }
      if (changed) {
        await delegate.update({ where: { id: row.id }, data });
        n++;
      }
    }
    if (n > 0) {
      perModel[model] = n;
      updated += n;
    }
  }
  return NextResponse.json({ updated, perModel });
}
