import { FastifyInstance } from "fastify";

export default async function organizacaoRoutes(fastify: FastifyInstance) {
  fastify.get("/organizacoes", async (request, reply) => {
    return [{ id: 1, nome: "Organização Exemplo" }];
  });
}
