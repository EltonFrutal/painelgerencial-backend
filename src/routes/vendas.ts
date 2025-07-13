// src/routes/vendas.ts

import { FastifyInstance } from "fastify";
import prisma from "../prisma/client";

export default async function vendasRoutes(fastify: FastifyInstance) {
    fastify.get("/vendas/analitico", {
        preValidation: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const { nivel, ano, mes } = request.query as {
                nivel?: "ano" | "mes" | "dia";
                ano?: string;
                mes?: string;
            };

            if (!nivel || !["ano", "mes", "dia"].includes(nivel)) {
                return reply.status(400).send({ error: "Parâmetro 'nivel' inválido ou ausente." });
            }

            const user = request.user as any;
            const idorganizacao = user?.idorganizacao;

            if (!idorganizacao) {
                return reply.status(401).send({ error: "Token inválido ou sem idorganizacao." });
            }

            let query = "";
            let params: any[] = [idorganizacao];

            if (nivel === "ano") {
                query = `
                    SELECT
                        EXTRACT(YEAR FROM dataemissao)::TEXT AS label,
                        SUM(valorvenda)::FLOAT AS total
                    FROM vendas
                    WHERE idorganizacao = $1
                    GROUP BY label
                    ORDER BY label;
                `;
            } else if (nivel === "mes") {
                if (!ano) {
                    return reply.status(400).send({ error: "Parâmetro 'ano' é necessário para o nível 'mes'." });
                }
                params.push(ano);
                query = `
                    SELECT
                        TO_CHAR(dataemissao, 'MM') AS label,
                        SUM(valorvenda)::FLOAT AS total
                    FROM vendas
                    WHERE idorganizacao = $1
                    AND EXTRACT(YEAR FROM dataemissao) = $2::int
                    GROUP BY label
                    ORDER BY label;
                `;
            } else if (nivel === "dia") {
                if (!ano || !mes) {
                    return reply.status(400).send({ error: "Parâmetros 'ano' e 'mes' são necessários para o nível 'dia'." });
                }
                params.push(ano, mes);
                query = `
                    SELECT
                        TO_CHAR(dataemissao, 'DD') AS label,
                        SUM(valorvenda)::FLOAT AS total
                    FROM vendas
                    WHERE idorganizacao = $1
                    AND EXTRACT(YEAR FROM dataemissao) = $2::int
                    AND EXTRACT(MONTH FROM dataemissao) = $3::int
                    GROUP BY label
                    ORDER BY label;
                `;
            }

            const result = await prisma.$queryRawUnsafe(query, ...params);

            return reply.send(result);
        } catch (error) {
            console.error("Erro em /vendas/analitico:", error);
            return reply.status(500).send({ error: "Erro ao buscar dados analíticos" });
        }
    });
}
