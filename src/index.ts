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
import iaRoutes from "./routes/ia"; // ✅ IMPORTADO AQUI
import indicadoresRoutes from "./routes/indicadores"; // ✅ NOVA ROTA

import dotenv from "dotenv";
dotenv.config();

async function buildServer() {
  const fastify = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: { translateTime: "HH:MM:ss Z", ignore: "pid,hostname" },
      },
    },
  });

  // ========================
  // Plugins
  // ========================
  await fastify.register(fastifyCors, { origin: "*" });
  await fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET || "pgwebia-secret" });
  await fastify.register(fastifyFormbody);

  // ========================
  // Middleware JWT
  // ========================
  fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      const decoded = await request.jwtVerify<{
        idassessor?: number;
        admin?: boolean;
        idusuario?: number;
        usuario?: string;
        idorganizacao?: number;
        organizacao?: string;
      }>();

      // Permite sobrescrever id da organização via header
      if (decoded.idassessor) {
        const orgIdHeader = request.headers["x-organization-id"];
        if (orgIdHeader) {
          const parsedOrgId = Number(orgIdHeader);
          if (!isNaN(parsedOrgId)) {
            decoded.idorganizacao = parsedOrgId;
            fastify.log.info(`🔄 idorganizacao sobrescrito via header: ${parsedOrgId}`);
          }
        }
      }

      (request as any).user = decoded;
    } catch (err) {
      console.error("❌ Erro no JWT verify:", err);
      reply.code(401).send({ error: "Token inválido ou não fornecido." });
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
  await fastify.register(iaRoutes); // ✅ ROTA DE IA REGISTRADA
  await fastify.register(indicadoresRoutes, { prefix: "/api" }); // ✅ NOVA ROTA

  // ========================
  // Rota raiz
  // ========================
  fastify.get("/", async () => {
    return { message: "✅ PGWebIA backend rodando!" };
  });

  // ========================
  // Inicialização do servidor
  // ========================
  const PORT = Number(process.env.PORT) || 3001;
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

buildServer();
