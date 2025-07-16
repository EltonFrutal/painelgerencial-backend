const jwt = require('jsonwebtoken');

// Criar um token JWT para testes
const token = jwt.sign({
  idusuario: 1,
  usuario: "admin",
  idorganizacao: 1111, // Usar organização com dados reais
  organizacao: "CLINIVET"
}, "PGWebIA@2025"); // Usar o secret correto

console.log("Token de teste:", token);

// Fazer uma requisição para testar a rota
const axios = require('axios');

async function testarRota() {
  try {
    const response = await axios.get('http://localhost:3001/api/vendas/lista', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Dados de vendas:", response.data.length > 0 ? `${response.data.length} vendas encontradas` : "Nenhuma venda encontrada");
    if (response.data.length > 0) {
      console.log("Primeira venda:", response.data[0]);
    }
  } catch (error) {
    console.error("Erro:", error.response?.data || error.message);
  }
}

testarRota();
