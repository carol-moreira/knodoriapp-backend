const { PrismaClient } = require('@prisma/client');

// instância única do prisma: reaproveitada entre recarregamentos (ex.: nodemon)
// para não abrir conexões novas a cada require e esgotar o pool do neon db
const global_ref = globalThis;

const prisma = global_ref.__prisma_client || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global_ref.__prisma_client = prisma;
}

module.exports = prisma;
