const http = require('http');
const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Servidor Node puro rodando no Render!" }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Rota não encontrada", statusCode: 404 }));
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor Node puro rodando em http://0.0.0.0:${PORT}`);
});
