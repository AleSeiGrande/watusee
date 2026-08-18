import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { resolveUploadFile, getUploadDirs } from '@/lib/uploads';

// POST /api/repair — finds corrupt image files (that contain URL strings instead of
// actual image data) and repairs them by fetching the real image via HTTP.
// One-time use: visit once after deploy, then remove this endpoint.

export async function POST() {
  const results: string[] = [];

  for (const dir of getUploadDirs()) {
    let files: string[];
    try {
      files = await fs.readdir(dir);
    } catch {
      continue;
    }

    for (const file of files) {
      const fullPath = `${dir}/${file}`;
      try {
        const stat = await fs.stat(fullPath);
        if (stat.size > 500) continue; // only suspect tiny files

        const content = await fs.readFile(fullPath, 'utf-8');
        if (!content.startsWith('/api/uploads/')) continue;

        // This file contains a URL string instead of image data — repair it
        const sourceUrl = content.trim();
        const origin = process.env.AUTH_URL || 'http://localhost:3000';

        try {
          const res = await fetch(`${origin}${sourceUrl}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buffer = Buffer.from(await res.arrayBuffer());

          if (buffer.length < 500) {
            results.push(`SKIP ${file}: source also too small (${buffer.length}b)`);
            continue;
          }

          // Dual write: to the current dir AND to data/ for persistence
          await fs.writeFile(fullPath, buffer);

          const dataDirs = getUploadDirs();
          for (const dataDir of dataDirs) {
            if (dataDir === dir) continue;
            try {
              await fs.writeFile(`${dataDir}/${file}`, buffer);
            } catch {
              // ignore — data dir may not exist
            }
          }

          results.push(`FIXED ${file}: ${stat.size}b → ${buffer.length}b (from ${sourceUrl})`);
        } catch (fetchErr: any) {
          results.push(`FAIL ${file}: could not fetch ${sourceUrl} — ${fetchErr.message}`);
        }
      } catch {
        // not a text file or read error — skip
      }
    }
  }

  if (results.length === 0) {
    return NextResponse.json({ message: 'No corrupt files found.', results });
  }
  return NextResponse.json({ message: `Processed ${results.length} file(s).`, results });
}
