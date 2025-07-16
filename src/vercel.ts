import "@fastify/jwt";
import Fastify, { FastifyRequest, FastifyReply } from "fastify";
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
    logger: process.env.NODE_ENV === "production" ? false : {
      transport: {
        target: "pino-pretty",
        options: { translateTime: "HH:MM:ss Z", ignore: "pid,hostname" },
      },
    },
  });

  // ========================
  // Plugins
  // ========================
  await fastify.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(fastifyFormbody);

  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "supersecret",
  });

  // ========================
  // Middleware de autenticação
  // ========================
  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await request.jwtVerify();
      (request as any).user = decoded;

      // Sobrescrever idorganizacao se vier no header
      const headerOrgId = request.headers["x-organization-id"];
      if (headerOrgId) {
        ((request as any).user as any).idorganizacao = parseInt(headerOrgId as string);
        console.log(`🔄 idorganizacao sobrescrito via header: ${headerOrgId}`);
      }
    } catch (err) {
      console.error("❌ Erro no JWT verify:", err);
      return reply.status(401).send({ error: "Token inválido ou não fornecido." });
    }
  });

  // ========================
  // Rotas
  // ========================
  await fastify.register(authRoutes, { prefix: "/auth" });
  await fastify.register(usuarioRoutes, { prefix: "/api" });
  await fastify.register(organizacaoRoutes, { prefix: "/api" });
  await fastify.register(vendasRoutes, { prefix: "/api" });
  await fastify.register(dreRoutes, { prefix: "/api" });
  await fastify.register(iaRoutes);
  await fastify.register(indicadoresRoutes, { prefix: "/api" });

  // ========================
  // Rota raiz
  // ========================
  fastify.get("/", async () => {
    return { message: "✅ PGWebIA backend rodando no Vercel!" };
  });

  app = fastify;
  return fastify;
}

// Para desenvolvimento local
if (process.env.NODE_ENV !== "production") {
  buildServer().then(async (fastify) => {
    const PORT = Number(process.env.PORT) || 3001;
    try {
      await fastify.listen({ port: PORT, host: "0.0.0.0" });
      console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
}

// Para Vercel (serverless)
export default async function handler(req: any, res: any) {
  const fastify = await buildServer();
  await fastify.ready();
  fastify.server.emit('request', req, res);
}
