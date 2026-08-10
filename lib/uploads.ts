import fs from 'fs/promises';
import path from 'path';

function getDataBaseDir(): string | null {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl?.startsWith('file:/')) {
    const dbPath = dbUrl.slice(5);
    return path.dirname(dbPath);
  }
  const cwd = process.cwd();
  const match = cwd.match(/^(\/home\/[^/]+\/domains\/[^/]+)/);
  if (match) return path.join(match[1], 'data');
  return null;
}

export function getUploadDirs(): string[] {
  const cwd = process.cwd();
  const base = getDataBaseDir();
  const dirs = [
    path.join(cwd, 'public', 'uploads'),
    path.join(cwd, 'public', 'uploads', 'adults'),
    path.join(cwd, 'public', 'play', 'uploads'),
    path.join(cwd, 'public', 'play', 'uploads', 'adults'),
  ];
  if (base) {
    dirs.push(
      path.join(base, 'uploads'),
      path.join(base, 'uploads', 'adults'),
      path.join(base, 'uploads', 'uploads'),
      path.join(base, 'uploads', 'uploads', 'adults'),
      path.join(base, 'play'),
      path.join(base, 'play', 'uploads'),
      path.join(base, 'play', 'uploads', 'adults'),
    );
  }
  return dirs;
}

export async function resolveUploadFile(filename: string): Promise<string | null> {
  const safe = path.basename(filename);
  if (safe !== filename || safe === '.' || safe === '..') return null;
  for (const dir of getUploadDirs()) {
    const full = path.join(dir, safe);
    try {
      await fs.access(full);
      return full;
    } catch {
      // keep looking
    }
  }
  return null;
}

export async function unlinkUploadFile(urlOrFilename: string): Promise<void> {
  const safe = path.basename(urlOrFilename);
  for (const dir of getUploadDirs()) {
    try {
      await fs.unlink(path.join(dir, safe));
    } catch {
      // ignore missing files
    }
  }
}

export function contentTypeFor(file: string): string {
  const ext = path.extname(file).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.avif':
      return 'image/avif';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}
