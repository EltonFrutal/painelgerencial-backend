import { FastifyInstance } from "fastify";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function iaRoutes(fastify: FastifyInstance) {
  fastify.post("/api/openai/vendas", async (request, reply) => {
    const schema = z.object({
      dadosVendas: z.array(z.object({
        idvendas: z.number(),
        cliente: z.string(),
        pedido: z.string().nullable(),
        dataemissao: z.string(),
        valorvenda: z.any(), // Aceitar qualquer tipo por enquanto
        valorcusto: z.any().nullable(),
        valorlucro: z.any().nullable(),
        tipo: z.string().nullable(),
        vendedor: z.string().nullable(),
        empresa: z.string().nullable()
      })).optional()
    });

    try {
      const { dadosVendas } = schema.parse(request.body);
      
      const prompt = `Analise os seguintes dados de vendas e forneça insights profissionais:

${dadosVendas ? JSON.stringify(dadosVendas, null, 2) : "Dados não fornecidos"}

Forneça uma análise profissional focada em:
1. Situação geral das vendas
2. Clientes com maior volume de compras
3. Performance dos vendedores
4. Tendências de lucro e margem
5. Recomendações estratégicas para melhorar as vendas

Responda de forma clara e profissional, focando em insights práticos para gestão comercial.`;

      const resposta = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      const resumo = resposta.choices[0]?.message?.content;
      reply.send({ resumo });
      
    } catch (err: any) {
      console.error("❌ Erro ao chamar OpenAI:", err);
      
      // Tratamento específico para diferentes tipos de erro
      if (err.code === 'insufficient_quota' || 
          err.message?.includes('insufficient_quota') || 
          err.message?.includes('quota') || 
          err.message?.includes('billing')) {
        reply.status(400).send({ 
          erro: "Créditos da IA esgotados",
          message: "insufficient_quota",
          tipo: "sem_creditos"
        });
      } else if (err.code === 'rate_limit_exceeded' || 
                 err.message?.includes('rate_limit')) {
        reply.status(429).send({ 
          erro: "Limite de requisições excedido",
          message: "rate_limit_exceeded",
          tipo: "limite_excedido"
        });
      } else if (err.status === 401 || err.message?.includes('unauthorized')) {
        reply.status(401).send({ 
          erro: "Erro de autenticação com OpenAI",
          message: "unauthorized",
          tipo: "erro_autenticacao"
        });
      } else {
        reply.status(500).send({ 
          erro: "Erro interno do servidor",
          message: err.message || "Erro desconhecido",
          tipo: "erro_interno"
        });
      }
    }
  });

  fastify.post("/api/openai/a-receber", async (request, reply) => {
    const schema = z.object({
      dadosReceber: z.array(z.object({
        cliente: z.string(),
        valor: z.number(),
        vencimento: z.string(),
        status: z.string()
      })).optional()
    });

    try {
      const { dadosReceber } = schema.parse(request.body);
      
      const prompt = `Analise os seguintes dados de contas a receber e forneça insights profissionais:

${dadosReceber ? JSON.stringify(dadosReceber, null, 2) : "Dados não fornecidos"}

Forneça uma análise profissional focada em:
1. Situação geral das contas a receber
2. Clientes com maior exposição
3. Sugestões de cobrança
4. Indicadores de risco
5. Recomendações estratégicas

Responda de forma clara e profissional, focando em insights práticos para gestão financeira.`;

      const resposta = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      const resumo = resposta.choices[0]?.message?.content;
      reply.send({ resumo });
      
    } catch (err: any) {
      console.error("❌ Erro ao chamar OpenAI:", err);
      
      // Tratamento específico para diferentes tipos de erro
      if (err.code === 'insufficient_quota' || 
          err.message?.includes('insufficient_quota') || 
          err.message?.includes('quota') || 
          err.message?.includes('billing')) {
        reply.status(400).send({ 
          erro: "Créditos da IA esgotados",
          message: "insufficient_quota",
          tipo: "sem_creditos"
        });
      } else if (err.code === 'rate_limit_exceeded' || 
                 err.message?.includes('rate_limit')) {
        reply.status(429).send({ 
          erro: "Limite de requisições excedido",
          message: "rate_limit_exceeded",
          tipo: "limite_excedido"
        });
      } else if (err.status === 401 || err.message?.includes('unauthorized')) {
        reply.status(401).send({ 
          erro: "Erro de autenticação com OpenAI",
          message: "unauthorized",
          tipo: "erro_autenticacao"
        });
      } else {
        reply.status(500).send({ 
          erro: "Erro interno do servidor",
          message: err.message || "Erro desconhecido",
          tipo: "erro_interno"
        });
      }
    }
  });

  fastify.post("/api/ia", async (request, reply) => {
    const schema = z.object({
      pergunta: z.string(),
      contexto: z.string().optional()
    });

    try {
      const { pergunta, contexto } = schema.parse(request.body);
      
      const prompt = contexto 
        ? `Contexto: ${contexto}\n\nPergunta: ${pergunta}`
        : pergunta;

      const resposta = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      const respostaTexto = resposta.choices[0]?.message?.content;
      reply.send({ resposta: respostaTexto });
      
    } catch (err: any) {
      console.error("❌ Erro ao chamar OpenAI:", err);
      
      // Tratamento específico para diferentes tipos de erro
      if (err.code === 'insufficient_quota' || 
          err.message?.includes('insufficient_quota') || 
          err.message?.includes('quota') || 
          err.message?.includes('billing')) {
        reply.status(400).send({ 
          erro: "Créditos da IA esgotados",
          message: "insufficient_quota",
          tipo: "sem_creditos"
        });
      } else if (err.code === 'rate_limit_exceeded' || 
                 err.message?.includes('rate_limit')) {
        reply.status(429).send({ 
          erro: "Limite de requisições excedido",
          message: "rate_limit_exceeded",
          tipo: "limite_excedido"
        });
      } else if (err.status === 401 || err.message?.includes('unauthorized')) {
        reply.status(401).send({ 
          erro: "Erro de autenticação com OpenAI",
          message: "unauthorized",
          tipo: "erro_autenticacao"
        });
      } else {
        reply.status(500).send({ 
          erro: "Erro interno do servidor",
          message: err.message || "Erro desconhecido",
          tipo: "erro_interno"
        });
      }
    }
  });
}
