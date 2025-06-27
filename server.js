import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: true });

const prisma = new PrismaClient();

fastify.get('/ping', async (request, reply) => {
  try {
    const orgs = await prisma.organizacao.findMany();
    reply.send({ message: 'Pong', organizacoes: orgs });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Erro ao conectar ao banco.' });
  }
});

fastify.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Servidor rodando em ${address}`);
});
