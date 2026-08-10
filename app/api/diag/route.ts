import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const cwd = process.cwd();
  const root = process.env.WATUSEE_ROOT || null;
  const dbUrl = process.env.DATABASE_URL || '';

  const probe = (dir: string) => {
    try {
      const entries = fs.readdirSync(dir);
      return { exists: true, count: entries.length, sample: entries.slice(0, 3) };
    } catch {
      return { exists: false, count: 0, sample: [] };
    }
  };

  const uploadsAt = (base: string | null) => {
    if (!base) return null;
    const dir = path.join(base, 'public', 'uploads');
    const p = probe(dir);
    if (p.exists) {
      const files = fs.readdirSync(dir);
      p.sample = files.slice(0, 5);
      (p as any).hasBroken1 = files.includes('drawn-d7664d4c320707d6.png');
      (p as any).hasBroken2 = files.includes('drawn-99579c1ab682fa5d.png');
      (p as any).hasWorking = files.includes('drawn-7e6c3667da57adbb.png');
    }
    return p;
  };

  return NextResponse.json({
    cwd,
    watuseeRoot: root,
    cwdPublicUploads: uploadsAt(cwd),
    rootPublicUploads: uploadsAt(root),
    dbUrlPrefix: dbUrl.slice(0, 60),
    hasPublicAtCwd: (() => {
      try { return fs.statSync(path.join(cwd, 'public')).isDirectory(); } catch { return false; }
    })(),
    hasPublicAtRoot: (() => {
      if (!root) return null;
      try { return fs.statSync(path.join(root, 'public')).isDirectory(); } catch { return false; }
    })(),
  });
}
