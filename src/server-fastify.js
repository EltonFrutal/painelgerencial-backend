const http = require('http');
const Fastify = require('fastify');

const PORT = process.env.PORT || 3001;

const fastify = Fastify({ logger: true });

fastify.get('/', async (request, reply) => {
    return { message: "PGWebIA backend rodando via Fastify no Render!" };
});

fastify.get('/ping', async (request, reply) => {
    return { message: "pong" };
});

// Cria o servidor HTTP manualmente garantindo exposição
const server = http.createServer((req, res) => {
    fastify.routing(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Fastify rodando via HTTP em http://0.0.0.0:${PORT}`);
});
