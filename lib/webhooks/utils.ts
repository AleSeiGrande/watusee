import crypto from 'crypto';

/** Comparación en tiempo constante para secretos. */
export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function readString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function toDate(value: unknown): Date | null {
  let date: Date;
  if (typeof value === 'string') {
    date = new Date(value);
  } else if (typeof value === 'number') {
    date = new Date(value);
  } else {
    return null;
  }
  return Number.isNaN(date.getTime()) ? null : date;
}
