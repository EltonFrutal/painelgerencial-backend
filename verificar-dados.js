const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarDados() {
  try {
    // Verificar se há dados na tabela vendas
    const vendas = await prisma.vendas.findMany({
      take: 5,
      orderBy: { dataemissao: 'desc' }
    });
    
    console.log("Vendas encontradas:", vendas);
    
    // Verificar organizações
    const organizacoes = await prisma.organizacao.findMany({
      take: 5
    });
    
    console.log("Organizações encontradas:", organizacoes);
    
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarDados();
