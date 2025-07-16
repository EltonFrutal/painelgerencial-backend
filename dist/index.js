"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const ia_1 = __importDefault(require("./routes/ia")); // ✅ IMPORTADO AQUI
const indicadores_1 = __importDefault(require("./routes/indicadores")); // ✅ NOVA ROTA
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function buildServer() {
    const fastify = (0, fastify_1.default)({
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
    await fastify.register(cors_1.default, { origin: "*" });
    await fastify.register(jwt_1.default, { secret: process.env.JWT_SECRET || "pgwebia-secret" });
    await fastify.register(formbody_1.default);
    // ========================
    // Middleware JWT
    // ========================
    fastify.decorate("authenticate", async function (request, reply) {
        try {
            const decoded = await request.jwtVerify();
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
            request.user = decoded;
        }
        catch (err) {
            console.error("❌ Erro no JWT verify:", err);
            reply.code(401).send({ error: "Token inválido ou não fornecido." });
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
    await fastify.register(ia_1.default); // ✅ ROTA DE IA REGISTRADA
    await fastify.register(indicadores_1.default, { prefix: "/api" }); // ✅ NOVA ROTA
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
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
buildServer();
