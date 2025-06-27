// server.js

import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

// force redeploy

// Inicializa o Fastify com logs habilitados
const fastify = Fastify({ logger: true });

// Habilita CORS para qualquer origem
await fastify.register(cors, { origin: true });

// Inicializa o Prisma Client
const prisma = new PrismaClient();

// Rota de teste de conexão com o banco
fastify.get('/ping', async (request, reply) => {
  try {
    const orgs = await prisma.organizacao.findMany();
    reply.send({ message: 'Pong', organizacoes: orgs });
  } catch (error) {
    console.error('Erro ao conectar ao banco:', error);
    reply.status(500).send({
      error: 'Erro ao conectar ao banco.',
      detalhe: error.message,
      stack: error.stack
    });
  }
});

// Inicia o servidor Fastify
fastify.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Servidor rodando em ${address}`);
});
