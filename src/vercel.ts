import { VercelRequest, VercelResponse } from '@vercel/node';
import "@fastify/jwt";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyFormbody from "@fastify/formbody";

import authRoutes from "./routes/auth";
import usuarioRoutes from "./routes/usuario";
import organizacaoRoutes from "./routes/organizacao";
import vendasRoutes from "./routes/vendas";
import dreRoutes from "./routes/dre";
import iaRoutes from "./routes/ia";
import indicadoresRoutes from "./routes/indicadores";

import dotenv from "dotenv";
dotenv.config();

let app: any = null;

async function buildServer() {
  if (app) return app;

  const fastify = Fastify({
    logger: false,
  });

  // CORS
  await fastify.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(fastifyFormbody);

  // JWT
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "supersecret",
  });

  // Middleware de autenticação
  fastify.decorate("authenticate", async (request: any, reply: any) => {
    try {
      const decoded = await request.jwtVerify();
      request.user = decoded;

      const headerOrgId = request.headers["x-organization-id"];
      if (headerOrgId) {
        (request.user as any).idorganizacao = parseInt(headerOrgId as string);
      }
    } catch (err) {
      return reply.status(401).send({ error: "Token inválido ou não fornecido." });
    }
  });

  // Rotas
  await fastify.register(authRoutes, { prefix: "/auth" });
  await fastify.register(usuarioRoutes, { prefix: "/api" });
  await fastify.register(organizacaoRoutes, { prefix: "/api" });
  await fastify.register(vendasRoutes, { prefix: "/api" });
  await fastify.register(dreRoutes, { prefix: "/api" });
  await fastify.register(iaRoutes);
  await fastify.register(indicadoresRoutes, { prefix: "/api" });

  // Rota raiz
  fastify.get("/", async () => {
    return { message: "✅ PGWebIA backend rodando no Vercel!" };
  });

  await fastify.ready();
  app = fastify;
  return fastify;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const fastify = await buildServer();
    const response = await fastify.inject({
      method: req.method as any,
      url: req.url || '/',
      headers: req.headers,
      payload: req.body,
    });
    
    res.status(response.statusCode);
    
    // Definir headers
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value as string);
    });
    
    res.send(response.body);
  } catch (error) {
    console.error('Erro no handler:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
