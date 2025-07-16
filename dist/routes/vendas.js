"use strict";
// src/routes/vendas.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = vendasRoutes;
const client_1 = __importDefault(require("../prisma/client"));
const zod_1 = require("zod");
async function vendasRoutes(fastify) {
    // ============================
    // 🔹 ROTA 1 - /vendas/lista
    // ============================
    fastify.get("/vendas/lista", {
        preValidation: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const user = request.user;
            const idorganizacao = user?.idorganizacao;
            if (!idorganizacao) {
                return reply.status(401).send({ error: "Token inválido ou sem idorganizacao." });
            }
            const query = `
        SELECT 
          idvendas,
          cliente,
          pedido,
          dataemissao,
          valorvenda::FLOAT as valorvenda,
          valorcusto::FLOAT as valorcusto,
          valorlucro::FLOAT as valorlucro,
          tipo,
          vendedor,
          empresa
        FROM vendas 
        WHERE idorganizacao = $1 
        AND dataemissao >= CURRENT_DATE - INTERVAL '6 months'
        ORDER BY dataemissao DESC
        LIMIT 100;
      `;
            const result = await client_1.default.$queryRawUnsafe(query, idorganizacao);
            const resultWithNumbers = result.map(item => ({
                ...item,
                valorvenda: parseFloat(item.valorvenda) || 0,
                valorcusto: parseFloat(item.valorcusto) || 0,
                valorlucro: parseFloat(item.valorlucro) || 0
            }));
            return reply.send(resultWithNumbers);
        }
        catch (error) {
            console.error("❌ Erro em /vendas/lista:", error);
            return reply.status(500).send({ error: "Erro ao buscar vendas" });
        }
    });
    // ============================
    // 🔹 ROTA 2 - /vendas/analitico
    // ============================
    fastify.get("/vendas/analitico", {
        preValidation: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const { nivel, ano, mes } = request.query;
            if (!nivel || !["ano", "mes", "dia"].includes(nivel)) {
                return reply.status(400).send({ error: "Parâmetro 'nivel' inválido ou ausente." });
            }
            const user = request.user;
            const idorganizacao = user?.idorganizacao;
            if (!idorganizacao) {
                return reply.status(401).send({ error: "Token inválido ou sem idorganizacao." });
            }
            let query = "";
            const params = [idorganizacao];
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
            }
            else if (nivel === "mes") {
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
            }
            else if (nivel === "dia") {
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
            const result = await client_1.default.$queryRawUnsafe(query, ...params);
            return reply.send(result);
        }
        catch (error) {
            console.error("❌ Erro em /vendas/analitico:", error);
            return reply.status(500).send({ error: "Erro ao buscar dados analíticos" });
        }
    });
    // ============================
    // 🔹 ROTA 3 - /vendas/detalhes-dia
    // ============================
    fastify.get("/vendas/detalhes-dia", {
        preValidation: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const schema = zod_1.z.object({
                ano: zod_1.z.string(),
                mes: zod_1.z.string(),
                dia: zod_1.z.string(),
                idorganizacao: zod_1.z.string(),
            });
            const { ano, mes, dia, idorganizacao } = schema.parse(request.query);
            const query = `
        SELECT 
          pedido,
          cliente,
          vendedor,
          valorvenda::FLOAT as valorvenda,
          valorcusto::FLOAT as valorcusto,
          valorlucro::FLOAT as valorlucro
        FROM vendas
        WHERE idorganizacao = $1
        AND TO_CHAR(dataemissao, 'YYYY-MM-DD') = $2
        ORDER BY pedido;
      `;
            const datadia = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
            const result = await client_1.default.$queryRawUnsafe(query, Number(idorganizacao), datadia);
            return reply.send(result);
        }
        catch (error) {
            console.error("❌ Erro em /vendas/detalhes-dia:", error);
            return reply.status(500).send({ error: "Erro ao buscar detalhes do dia" });
        }
    });
}
