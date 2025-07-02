// src/routes/auth.ts

import { FastifyInstance } from "fastify";
import prisma from "../prisma/client";
import bcrypt from "bcrypt";

export default async function authRoutes(fastify: FastifyInstance) {
    // LOGIN DE USUÁRIO
    fastify.post("/login", async (request, reply) => {
        const { idorganizacao, usuario, senha } = request.body as {
            idorganizacao: number,
            usuario: string,
            senha: string
        };

        try {
            const user = await prisma.usuario.findFirst({
                where: {
                    usuario,
                    idorganizacao
                }
            });

            if (!user) {
                return reply.status(401).send({ message: "Usuário ou organização não encontrados." });
            }

            const senhaValida = await bcrypt.compare(senha, user.senhahash);
            if (!senhaValida) {
                return reply.status(401).send({ message: "Senha inválida." });
            }

            const organizacao = await prisma.organizacao.findFirst({
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
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: "Erro ao realizar login." });
        }
    });
}
