"use strict";
// src/routes/auth.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function authRoutes(fastify) {
    // LOGIN DE USUÁRIO
    fastify.post("/login/usuario", async (request, reply) => {
        const { idorganizacao, usuario, senha } = request.body;
        try {
            const user = await client_1.default.usuario.findFirst({
                where: {
                    usuario,
                    idorganizacao
                }
            });
            if (!user) {
                return reply.status(401).send({ message: "Usuário ou organização não encontrados." });
            }
            const senhaValida = await bcrypt_1.default.compare(senha, user.senhahash);
            if (!senhaValida) {
                return reply.status(401).send({ message: "Senha inválida." });
            }
            const organizacao = await client_1.default.organizacao.findFirst({
                where: {
                    idorganizacao
                }
            });
            const token = fastify.jwt.sign({
                idusuario: user.idusuario,
                usuario: user.usuario,
                idorganizacao: user.idorganizacao,
                organizacao: organizacao?.organizacao || ""
            });
            return reply.send({
                token,
                usuario: user.usuario,
                idusuario: user.idusuario,
                idorganizacao: user.idorganizacao,
                organizacao: organizacao?.organizacao || ""
            });
        }
        catch (error) {
            console.error(error);
            return reply.status(500).send({ message: "Erro ao realizar login." });
        }
    });
}
