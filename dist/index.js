"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const auth_1 = __importDefault(require("./routes/auth"));
const usuario_1 = __importDefault(require("./routes/usuario"));
const organizacao_1 = __importDefault(require("./routes/organizacao"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function buildServer() {
    const fastify = (0, fastify_1.default)({ logger: true });
    fastify.register(cors_1.default, { origin: "*" });
    fastify.register(jwt_1.default, { secret: "pgwebia-secret" });
    fastify.register(auth_1.default, { prefix: "/auth" });
    fastify.register(usuario_1.default, { prefix: "/api" });
    fastify.register(organizacao_1.default, { prefix: "/api" });
    fastify.get("/", async (request, reply) => {
        return { message: "PGWebIA backend rodando!" };
    });
    const PORT = Number(process.env.PORT) || 3001;
    fastify.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
        if (err) {
            fastify.log.error(err);
            process.exit(1);
        }
        fastify.log.info(`✅ Servidor rodando em ${address}`);
    });
}
buildServer();
