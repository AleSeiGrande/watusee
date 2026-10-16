import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getEntitlements } from '@/lib/entitlements';

// GET /api/stories/challenge — imágenes aleatorias del Imaginarium para armar una historia.
// Plan gratis: 4 imágenes. Planes Frida / Da Vinci (feature story.more_images): hasta 6.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const entitlements = await getEntitlements(session.user.id);
  const max = entitlements.features.includes('story.more_images') ? 6 : 4;

  const total = await prisma.playImage.count();
  const take = Math.min(max, total);
  if (take < 4) {
    return NextResponse.json({ error: 'No hay suficientes imágenes en el Imaginarium' }, { status: 400 });
  }

  const skip = Math.floor(Math.random() * Math.max(1, total - take + 1));
  const images = await prisma.playImage.findMany({
    skip,
    take,
    orderBy: { id: 'asc' },
    select: { id: true, imageUrl: true, title: true },
  });

  // Mezcla simple (Fisher-Yates).
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [images[i], images[j]] = [images[j], images[i]];
  }

  return NextResponse.json({ images, max });
}
