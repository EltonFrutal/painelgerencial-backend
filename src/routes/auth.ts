// src/routes/auth.ts

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import prisma from "../prisma/client";
import bcrypt from "bcrypt";

interface LoginRequestBody {
    idorganizacao: number;
    usuario: string;
    senha: string;
}

export default async function authRoutes(fastify: FastifyInstance) {

    // ✅ LOGIN DE USUÁRIO FINAL
    fastify.post("/login", async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) => {
        try {
            const { idorganizacao, usuario, senha } = request.body || {};

            if (!idorganizacao || !usuario || !senha) {
                return reply.status(400).send({ message: "Todos os campos são obrigatórios." });
            }

            const user = await prisma.usuario.findFirst({
                where: { usuario, idorganizacao }
            });

            if (!user) {
                return reply.status(401).send({ message: "Usuário ou organização não encontrados." });
            }

            const senhaValida = await bcrypt.compare(senha, user.senhahash);
            if (!senhaValida) {
                return reply.status(401).send({ message: "Senha inválida." });
            }

            const organizacao = await prisma.organizacao.findUnique({
                where: { idorganizacao },
                select: { organizacao: true }
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
        } catch (error) {
            console.error("Erro detalhado no login:", error);
            return reply.status(500).send({
                message: "Erro ao realizar login.",
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    });

    // ✅ LOGIN DE ASSESSOR
    fastify.post("/login-assessor", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { assessor: assessorNome, senha } = request.body as { assessor: string; senha: string };

            if (!assessorNome || !senha) {
                return reply.status(400).send({ message: "Assessor e senha são obrigatórios." });
            }

            const assessor = await prisma.assessor.findFirst({
                where: { assessor: assessorNome }
            });

            if (!assessor) {
                return reply.status(401).send({ message: "Assessor não encontrado." });
            }

            const senhaValida = await bcrypt.compare(senha, assessor.senhahash);
            if (!senhaValida) {
                return reply.status(401).send({ message: "Senha inválida." });
            }

            const organizacoes = await prisma.assessororganizacao.findMany({
                where: { idassessor: assessor.id },
                select: {
                    idorganizacao: true,
                    organizacao: { select: { organizacao: true } }
                }
            });

            const organizacoesFormatadas = organizacoes.map((o) => ({
                idorganizacao: o.idorganizacao,
                nomeorganizacao: o.organizacao?.organizacao || "Sem Nome"
            }));

            const token = fastify.jwt.sign({
                idassessor: assessor.id,
                assessor: assessor.assessor,
                admin: assessor.admin
            });

            return reply.send({
                token,
                assessor: assessor.assessor,
                idassessor: assessor.id,
                admin: assessor.admin,
                organizacoes: organizacoesFormatadas
            });
        } catch (error) {
            console.error("Erro detalhado no login-assessor:", error);
            return reply.status(500).send({
                message: "Erro ao realizar login-assessor.",
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    });

    // ✅ ROTA PARA O ASSESSOR GERAR NOVO TOKEN COM ORGANIZAÇÃO
    fastify.post("/assessor-set-org", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { token, idorganizacao } = request.body as { token: string, idorganizacao: number };

            const decoded = fastify.jwt.decode<{ idassessor: number, assessor: string, admin: boolean }>(token);

            if (!decoded || !decoded.idassessor) {
                return reply.status(400).send({ message: "Token inválido." });
            }

            const organizacao = await prisma.organizacao.findUnique({
                where: { idorganizacao },
                select: { organizacao: true }
            });

            if (!organizacao) {
                return reply.status(404).send({ message: "Organização não encontrada." });
            }

            const newToken = fastify.jwt.sign({
                idassessor: decoded.idassessor,
                assessor: decoded.assessor,
                admin: decoded.admin,
                idorganizacao,
                organizacao: organizacao.organizacao
            });

            return reply.send({ token: newToken });
        } catch (error) {
            console.error("Erro no assessor-set-org:", error);
            return reply.status(500).send({
                message: "Erro ao definir organização para assessor.",
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    });
}
