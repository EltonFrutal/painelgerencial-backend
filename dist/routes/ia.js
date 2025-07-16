"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = iaRoutes;
const zod_1 = require("zod");
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
async function iaRoutes(fastify) {
    fastify.post("/api/openai/vendas", async (request, reply) => {
        const schema = zod_1.z.object({
            dadosVendas: zod_1.z.array(zod_1.z.object({
                idvendas: zod_1.z.number(),
                cliente: zod_1.z.string(),
                pedido: zod_1.z.string().nullable(),
                dataemissao: zod_1.z.string(),
                valorvenda: zod_1.z.any(), // Aceitar qualquer tipo por enquanto
                valorcusto: zod_1.z.any().nullable(),
                valorlucro: zod_1.z.any().nullable(),
                tipo: zod_1.z.string().nullable(),
                vendedor: zod_1.z.string().nullable(),
                empresa: zod_1.z.string().nullable()
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
        }
        catch (err) {
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
            }
            else if (err.code === 'rate_limit_exceeded' ||
                err.message?.includes('rate_limit')) {
                reply.status(429).send({
                    erro: "Limite de requisições excedido",
                    message: "rate_limit_exceeded",
                    tipo: "limite_excedido"
                });
            }
            else if (err.status === 401 || err.message?.includes('unauthorized')) {
                reply.status(401).send({
                    erro: "Erro de autenticação com OpenAI",
                    message: "unauthorized",
                    tipo: "erro_autenticacao"
                });
            }
            else {
                reply.status(500).send({
                    erro: "Erro interno do servidor",
                    message: err.message || "Erro desconhecido",
                    tipo: "erro_interno"
                });
            }
        }
    });
    fastify.post("/api/openai/a-receber", async (request, reply) => {
        const schema = zod_1.z.object({
            dadosReceber: zod_1.z.array(zod_1.z.object({
                cliente: zod_1.z.string(),
                valor: zod_1.z.number(),
                vencimento: zod_1.z.string(),
                status: zod_1.z.string()
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
        }
        catch (err) {
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
            }
            else if (err.code === 'rate_limit_exceeded' ||
                err.message?.includes('rate_limit')) {
                reply.status(429).send({
                    erro: "Limite de requisições excedido",
                    message: "rate_limit_exceeded",
                    tipo: "limite_excedido"
                });
            }
            else if (err.status === 401 || err.message?.includes('unauthorized')) {
                reply.status(401).send({
                    erro: "Erro de autenticação com OpenAI",
                    message: "unauthorized",
                    tipo: "erro_autenticacao"
                });
            }
            else {
                reply.status(500).send({
                    erro: "Erro interno do servidor",
                    message: err.message || "Erro desconhecido",
                    tipo: "erro_interno"
                });
            }
        }
    });
    fastify.post("/api/ia", async (request, reply) => {
        const schema = zod_1.z.object({
            pergunta: zod_1.z.string(),
            contexto: zod_1.z.string().optional()
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
        }
        catch (err) {
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
            }
            else if (err.code === 'rate_limit_exceeded' ||
                err.message?.includes('rate_limit')) {
                reply.status(429).send({
                    erro: "Limite de requisições excedido",
                    message: "rate_limit_exceeded",
                    tipo: "limite_excedido"
                });
            }
            else if (err.status === 401 || err.message?.includes('unauthorized')) {
                reply.status(401).send({
                    erro: "Erro de autenticação com OpenAI",
                    message: "unauthorized",
                    tipo: "erro_autenticacao"
                });
            }
            else {
                reply.status(500).send({
                    erro: "Erro interno do servidor",
                    message: err.message || "Erro desconhecido",
                    tipo: "erro_interno"
                });
            }
        }
    });
}
