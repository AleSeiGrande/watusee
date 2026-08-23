import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { unlinkUploadFile } from '@/lib/uploads';

// Helper para crear notificación al autor del post
async function notifyAuthor(postId: string, actorId: string, type: string, detail: string) {
  try {
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (post && post.authorId !== actorId) {
      await prisma.notification.create({
        data: { userId: post.authorId, actorId, postId, type, detail },
      });
    }
  } catch (e) {
    console.error('Error creating notification:', e);
  }
}

// POST /api/posts/[id] — maneja acciones: share, react
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { action, type } = await req.json();
    const userId = session.user.id;

    if (action === 'share') {
      const post = await prisma.post.update({
        where: { id },
        data: { sharesCount: { increment: 1 } },
      });
      notifyAuthor(id, userId, 'share', '');
      return NextResponse.json({ sharesCount: post.sharesCount });
    }

    if (action === 'react' && type) {
      const validTypes = ['like', 'fun', 'angry', 'indifferent', 'surprised', 'disgust'];
      if (!validTypes.includes(type)) {
        return NextResponse.json({ error: 'Tipo de reacción inválido' }, { status: 400 });
      }

      const prev = await prisma.reaction.findFirst({
        where: { postId: id, userId },
      });

      if (prev?.type === type) {
        // Click en el mismo emoji → deseleccionar
        await prisma.reaction.delete({ where: { id: prev.id } });
        await prisma.post.update({ where: { id }, data: { likes: { decrement: 1 } } });
        const total = await prisma.reaction.count({ where: { postId: id, type } });
        const allTotal = await prisma.reaction.count({ where: { postId: id } });
        return NextResponse.json({ reacted: false, type, count: total, allCount: allTotal, prevType: null });
      }

      if (prev) {
        await prisma.reaction.delete({ where: { id: prev.id } });
      }

      await prisma.reaction.create({ data: { type, postId: id, userId } });
      await prisma.post.update({ where: { id }, data: { likes: { increment: 1 } } });
      notifyAuthor(id, userId, 'reaction', type);
      const total = await prisma.reaction.count({ where: { postId: id, type } });
      const allTotal = await prisma.reaction.count({ where: { postId: id } });
      return NextResponse.json({ reacted: true, type, count: total, allCount: allTotal, prevType: prev?.type || null });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE /api/posts/[id] — elimina un post del autor (y sus archivos de imagen).
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { _count: { select: { remixes: true } } },
    });
    if (!post) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'No tienes permiso para borrar este post' }, { status: 403 });
    }

    if (post._count.remixes > 0) {
      return NextResponse.json({ error: 'Este post tiene remixes; no se puede borrar' }, { status: 409 });
    }

    // Elimina los archivos de imagen (public y data persistente)
    for (const url of [post.originalImage, post.interpretedImage]) {
      if (!url) continue;
      await unlinkUploadFile(url);
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
