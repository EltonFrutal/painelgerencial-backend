"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dreRoutes;
const client_1 = __importDefault(require("../prisma/client"));
async function dreRoutes(fastify) {
    // 🔹 ROTA 1 - AGRUPAMENTO POR NIVEL1, NIVEL2, NIVEL3 E MESES (COM VALORES MENSAIS)
    fastify.get("/dre/por-nivel1-e-nivel2-e-nivel3", async (request, reply) => {
        const { idorganizacao, modelo, ano, tipo } = request.query;
        try {
            const resultado = await client_1.default.dre.findMany({
                where: {
                    idorganizacao: Number(idorganizacao),
                    modelo,
                    ano: Number(ano),
                    tipo,
                },
            });
            const agrupado = {};
            for (const item of resultado) {
                const n1 = item.nivel1 ?? "OUTROS";
                const n2 = item.nivel2 ?? "OUTROS";
                const n3 = item.nivel3 ?? "OUTROS";
                const mes = item.mes;
                const valor = Number(item.valorrealizado ?? 0);
                if (!agrupado[n1])
                    agrupado[n1] = {};
                if (!agrupado[n1][n2])
                    agrupado[n1][n2] = {};
                if (!agrupado[n1][n2][n3]) {
                    agrupado[n1][n2][n3] = {
                        valores: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 0])),
                    };
                    agrupado[n1][n2][n3].valores.total = 0;
                }
                agrupado[n1][n2][n3].valores[mes] += valor;
                agrupado[n1][n2][n3].valores.total += valor;
            }
            const dados = Object.entries(agrupado).flatMap(([nivel1, n2map]) => Object.entries(n2map).flatMap(([nivel2, n3map]) => Object.entries(n3map).map(([nivel3, obj]) => ({
                nivel1,
                nivel2,
                nivel3,
                valores: obj.valores,
            }))));
            reply.send({ data: dados });
        }
        catch (error) {
            console.error("❌ Erro ao buscar DRE com meses:", error);
            reply.status(500).send({ error: "Erro ao buscar DRE com meses" });
        }
    });
}
