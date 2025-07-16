"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
require("@fastify/jwt");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const auth_1 = __importDefault(require("./routes/auth"));
const usuario_1 = __importDefault(require("./routes/usuario"));
const organizacao_1 = __importDefault(require("./routes/organizacao"));
const vendas_1 = __importDefault(require("./routes/vendas"));
const dre_1 = __importDefault(require("./routes/dre"));
const ia_1 = __importDefault(require("./routes/ia"));
const indicadores_1 = __importDefault(require("./routes/indicadores"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let app = null;
async function buildServer() {
    if (app)
        return app;
    const fastify = (0, fastify_1.default)({
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
    await fastify.register(cors_1.default, {
        origin: true,
        credentials: true,
    });
    await fastify.register(formbody_1.default);
    await fastify.register(jwt_1.default, {
        secret: process.env.JWT_SECRET || "supersecret",
    });
    // ========================
    // Middleware de autenticação
    // ========================
    fastify.decorate("authenticate", async (request, reply) => {
        try {
            const decoded = await request.jwtVerify();
            request.user = decoded;
            // Sobrescrever idorganizacao se vier no header
            const headerOrgId = request.headers["x-organization-id"];
            if (headerOrgId) {
                request.user.idorganizacao = parseInt(headerOrgId);
                console.log(`🔄 idorganizacao sobrescrito via header: ${headerOrgId}`);
            }
        }
        catch (err) {
            console.error("❌ Erro no JWT verify:", err);
            return reply.status(401).send({ error: "Token inválido ou não fornecido." });
        }
    });
    // ========================
    // Rotas
    // ========================
    await fastify.register(auth_1.default, { prefix: "/auth" });
    await fastify.register(usuario_1.default, { prefix: "/api" });
    await fastify.register(organizacao_1.default, { prefix: "/api" });
    await fastify.register(vendas_1.default, { prefix: "/api" });
    await fastify.register(dre_1.default, { prefix: "/api" });
    await fastify.register(ia_1.default);
    await fastify.register(indicadores_1.default, { prefix: "/api" });
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
        }
        catch (err) {
            fastify.log.error(err);
            process.exit(1);
        }
    });
}
// Para Vercel (serverless)
async function handler(req, res) {
    const fastify = await buildServer();
    await fastify.ready();
    fastify.server.emit('request', req, res);
}
