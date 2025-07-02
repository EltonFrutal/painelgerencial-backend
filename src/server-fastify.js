const Fastify = require('fastify');

const PORT = process.env.PORT || 3001;

const fastify = Fastify({ logger: true });

fastify.get('/', async (request, reply) => {
    return { message: "PGWebIA backend rodando via Fastify no Render!" };
});

fastify.get('/ping', async (request, reply) => {
    return { message: "pong" };
});

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`✅ Fastify rodando em ${address}`);
});
