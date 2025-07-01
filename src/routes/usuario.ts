// src/routes/usuario.ts
import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export default async function usuarioRoutes(app: FastifyInstance) {
  // Protege a rota usando o plugin JWT
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // GET /api/usuarios - Lista todos os usuários
  app.get('/usuarios', async (request, reply) => {
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
      reply.status(500).send({ error: 'Erro ao buscar usuários' });
    }
  });
}
