// src/routes/usuario.ts
import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export default async function usuarioRoutes(app: FastifyInstance) {
  // 🔓 Rota pública (sem JWT)
  app.get('/usuarios/publico', async (_request, reply) => {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          idusuario: true,
          usuario: true,
          ativo: true,
        },
      });
      reply.send(usuarios);
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao buscar usuários (pública)' });
    }
  });

  // 🔒 Middleware JWT para rotas protegidas
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.send(err);
    }
  });

  // 🔒 Rota protegida
  app.get('/usuarios', async (_request, reply) => {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          idusuario: true,
          usuario: true,
          ativo: true,
        },
      });
      reply.send(usuarios);
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao buscar usuários (com JWT)' });
    }
  });
}
