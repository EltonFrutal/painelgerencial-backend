import { FastifyInstance } from "fastify";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function iaRoutes(fastify: FastifyInstance) {
  fastify.post("/api/openai/a-receber", async (request, reply) => {
    const schema = z.object({
      dadosReceber: z.array(
        z.object({
          cliente: z.string(),
          vencimento: z.string(),
          valor: z.number(),
          status: z.string(),
        })
      ),
    });

    try {
      const { dadosReceber } = schema.parse(request.body);

      const textoParaIA = dadosReceber
        .map((item) => {
          return `Cliente: ${item.cliente}, Vencimento: ${item.vencimento}, Valor: R$ ${item.valor.toFixed(
            2
          )}, Status: ${item.status}`;
        })
        .join("\n");

      const prompt = `Você é um analista financeiro. Gere um resumo objetivo com base nas contas a receber listadas abaixo, identificando principais riscos, atrasos e oportunidades de cobrança:

${textoParaIA}

Resuma em até 5 linhas.`;

      const resposta = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      return reply.send({ resumo: resposta.choices[0].message.content?.trim() });
    } catch (err: any) {
      console.error("❌ Erro ao chamar OpenAI:", err);

      // Erro por falta de crédito (insufficient_quota)
      if (err?.code === "insufficient_quota" || err?.type === "insufficient_quota") {
        return reply.status(400).send({
          erro: "Créditos da IA esgotados. Entre em contato com o suporte para renovar o plano.",
          message: "insufficient_quota"
        });
      }

      // Erro de limite de rate (429)
      if (err?.status === 429) {
        return reply.status(429).send({
          erro: "Limite de requisições excedido. Tente novamente em alguns minutos.",
          message: "rate_limit_exceeded"
        });
      }

      // Erro de autenticação (401)
      if (err?.status === 401) {
        return reply.status(401).send({
          erro: "Falha na autenticação com o serviço de IA.",
          message: "authentication_failed"
        });
      }

      // Erro de validação (corpo da requisição inválido)
      if (err?.name === "ZodError") {
        return reply.status(400).send({
          erro: "Os dados enviados não estão no formato esperado. Corrija e tente novamente.",
          message: "validation_error"
        });
      }

      // Fallback para erro interno genérico
      return reply.status(500).send({
        erro: "Erro inesperado ao tentar gerar o resumo. Tente novamente mais tarde.",
        message: "internal_error"
      });
    }
  });
}


