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

            // Validação de nível
            if (!nivel || !["ano", "mes", "dia"].includes(nivel)) {
                return reply.status(400).send({ error: "Parâmetro 'nivel' inválido ou ausente." });
            }

            const user = request.user as any;
            const idorganizacao = user?.idorganizacao;

            if (!idorganizacao) {
                return reply.status(401).send({ error: "Token inválido ou sem idorganizacao." });
            }
	    
	    console.log("🔍 User autenticado na rota vendas/analitico:", user);

            const vendas = await prisma.vendas.findMany({
                where: { idorganizacao },
                select: {
                    dataemissao: true,
                    valorvenda: true,
                },
            });

            const agrupado = new Map<string, number>();

            vendas.forEach((venda) => {
                const data = venda.dataemissao;
                let chave = "";

                if (nivel === "ano") {
                    chave = String(data.getFullYear());
                } else if (nivel === "mes") {
                    if (!ano || data.getFullYear() !== Number(ano)) return;
                    chave = String(data.getMonth() + 1).padStart(2, "0");
                } else if (nivel === "dia") {
                    if (!ano || !mes) return;
                    if (data.getFullYear() !== Number(ano) || (data.getMonth() + 1) !== Number(mes)) return;
                    chave = String(data.getDate()).padStart(2, "0");
                }

                const valorAtual = agrupado.get(chave) || 0;
                agrupado.set(chave, valorAtual + Number(venda.valorvenda ?? 0));
            });

            const result = Array.from(agrupado.entries())
                .map(([label, total]) => ({ label, total }))
                .sort((a, b) => Number(a.label) - Number(b.label));

            return reply.send(result);
        } catch (error) {
            console.error("Erro em /vendas/analitico:", error);
            return reply.status(500).send({ error: "Erro ao buscar dados analíticos" });
        }
    });
}
