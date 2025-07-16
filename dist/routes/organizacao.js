"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = organizacaoRoutes;
async function organizacaoRoutes(fastify) {
    fastify.get("/organizacoes", async (request, reply) => {
        return [{ id: 1, nome: "Organização Exemplo" }];
    });
}
