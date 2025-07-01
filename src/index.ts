import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import authRoutes from "./routes/auth";
import usuarioRoutes from "./routes/usuario";
import organizacaoRoutes from "./routes/organizacao";
import dotenv from "dotenv";
dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, { origin: "*" });
fastify.register(fastifyJwt, { secret: "pgwebia-secret" });
fastify.register(authRoutes, { prefix: "/auth" });
fastify.register(usuarioRoutes, { prefix: "/api" });
fastify.register(organizacaoRoutes, { prefix: "/api" });

fastify.get("/", async (request, reply) => {
    return { message: "PGWebIA backend rodando!" };
});

// 🚩 ALTERAÇÃO PARA FUNCIONAR NO RENDER:
const PORT = Number(process.env.PORT) || 3001;

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Servidor rodando em ${address}`);
});