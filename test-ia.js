const jwt = require('jsonwebtoken');
const axios = require('axios');

// Criar um token JWT para testes
const token = jwt.sign({
  idusuario: 1,
  usuario: "admin",
  idorganizacao: 1111,
  organizacao: "CLINIVET"
}, "PGWebIA@2025");

async function testarIA() {
  try {
    // Primeiro, buscar dados de vendas
    const vendasResponse = await axios.get('http://localhost:3001/api/vendas/lista', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Buscarmos ${vendasResponse.data.length} vendas para análise`);
    
    // Pegar apenas as primeiras 5 vendas para teste
    const dadosVendas = vendasResponse.data.slice(0, 5);
    
    // Testar a rota da IA
    const iaResponse = await axios.post('http://localhost:3001/api/openai/vendas', {
      dadosVendas: dadosVendas
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Análise da IA:");
    console.log(iaResponse.data.resumo);
    
  } catch (error) {
    console.error("Erro:", error.response?.data || error.message);
  }
}

testarIA();
