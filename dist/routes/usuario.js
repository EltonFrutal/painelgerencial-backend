"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = usuarioRoutes;
const prisma_1 = __importDefault(require("../lib/prisma"));
async function usuarioRoutes(app) {
    // Protege a rota usando o plugin JWT
    app.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.send(err);
        }
    });
    // GET /api/usuarios - Lista todos os usuários
    app.get('/usuarios', async (request, reply) => {
        try {
            const usuarios = await prisma_1.default.usuario.findMany({
                select: {
                    idusuario: true,
                    usuario: true,
                    ativo: true,
                },
            });
            reply.send(usuarios);
        }
        catch (error) {
            reply.status(500).send({ error: 'Erro ao buscar usuários' });
        }
    });
}
