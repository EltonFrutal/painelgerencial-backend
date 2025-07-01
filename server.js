// server.js

import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa Fastify com logs habilitados
const fastify = Fastify({ logger: true });

// Habilita CORS para qualquer origem (ajuste para domínios específicos se desejar)
await fastify.register(cors, { origin: true });

// Inicializa Prisma Client
const prisma = new PrismaClient();

// Rota de teste de conexão
fastify.get('/ping', async (request, reply) => {
  try {
    const count = await prisma.organizacao.count();
    reply.send({
      message: 'Pong',
      organizacoesCount: count
    });
  } catch (error) {
    fastify.log.error('Erro ao conectar ao banco:', error);
    reply.status(500).send({
      error: 'Erro ao conectar ao banco.',
      detalhe: error.message
    });
  }
});

// Finaliza conexões Prisma ao desligar
const gracefulShutdown = async () => {
  fastify.log.info('Desligando servidor...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Inicia o servidor
fastify.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Servidor rodando em ${address}`);
});
