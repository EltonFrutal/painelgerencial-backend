import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import authRoutes from "./routes/auth";
import usuarioRoutes from "./routes/usuario";
import organizacaoRoutes from "./routes/organizacao";
import dotenv from "dotenv";
dotenv.config();

async function buildServer() {
    const fastify = Fastify({ logger: true });

    fastify.register(fastifyCors, { origin: "*" });
    fastify.register(fastifyJwt, { secret: "pgwebia-secret" });
    fastify.register(authRoutes, { prefix: "/auth" });
    fastify.register(usuarioRoutes, { prefix: "/api" });
    fastify.register(organizacaoRoutes, { prefix: "/api" });

    fastify.get("/", async (request, reply) => {
        return { message: "PGWebIA backend rodando!" };
    });

    // 🚩 Adiciona Express para forçar o bind
    const express = require('express');
    const expressApp = express();

    expressApp.use(fastify.server);

    const PORT = process.env.PORT || 3001;
    expressApp.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Servidor rodando em http://0.0.0.0:${PORT}`);
    });
}

buildServer();
