/**
 * Crea (o repara) un usuario administrador.
 *
 *   node scripts/create-admin.cjs <usuario> <contraseña>
 *
 * Sirve para la primera puesta en marcha en producción: el seed solo crea el
 * usuario de sistema y las imágenes de juego, no un admin.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error('Uso: node scripts/create-admin.cjs <usuario> <contraseña>');
  process.exit(1);
}

if (password.length < 8) {
  console.error('La contraseña debe tener al menos 8 caracteres.');
  process.exit(1);
}

const prisma = new PrismaClient();

(async () => {
  const hash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { username } });

  const user = existing
    ? await prisma.user.update({
        where: { username },
        data: { password: hash, isAdmin: true },
      })
    : await prisma.user.create({
        data: { username, password: hash, isAdmin: true },
      });

  console.log(`[create-admin] ${user.username} listo (isAdmin = true).`);
  await prisma.$disconnect();
})().catch(async (err) => {
  console.error('[create-admin] Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
