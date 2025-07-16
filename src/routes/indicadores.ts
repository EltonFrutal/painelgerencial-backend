// src/routes/indicadores.ts

import { FastifyInstance } from "fastify";
import prisma from "../prisma/client";

export default async function indicadoresRoutes(fastify: FastifyInstance) {
  // Rota para buscar indicadores
  fastify.get("/indicadores", {
    preValidation: [fastify.authenticate], // ✅ exige token JWT
  }, async (request, reply) => {
    try {
      const user = request.user as any;
      const idorganizacao = user?.idorganizacao;

      if (!idorganizacao) {
        return reply.status(401).send({ error: "Token inválido ou sem idorganizacao." });
      }

      const { dia, idempresa } = request.query as {
        dia?: string;
        idempresa?: string;
      };

      let query = `
        SELECT 
          datacriacao,
          ano,
          mes,
          dia,
          idorganizacao,
          nomeorganizacao,
          idempresa,
          nomeempresa,
          indicador,
          meta::FLOAT as meta,
          realizado::FLOAT as realizado,
          direcao,
          variacao::FLOAT as variacao,
          cor,
          posicao,
          ativo
        FROM indicadores 
        WHERE idorganizacao = $1 
        AND ativo = true
      `;

      const params: any[] = [idorganizacao];

      // Filtro por dia (se não informado, pega o último dia disponível)
      if (dia) {
        query += ` AND dia = $${params.length + 1}`;
        params.push(parseInt(dia));
      } else {
        // Buscar o último dia disponível
        const lastDayQuery = `
          SELECT MAX(dia) as ultimo_dia 
          FROM indicadores 
          WHERE idorganizacao = $1 AND ativo = true
        `;
        const lastDayResult = await prisma.$queryRawUnsafe(lastDayQuery, idorganizacao);
        const ultimoDia = (lastDayResult as any[])[0]?.ultimo_dia;
        
        if (ultimoDia) {
          query += ` AND dia = $${params.length + 1}`;
          params.push(ultimoDia);
        }
      }

      // Filtro por empresa (se informado)
      if (idempresa) {
        query += ` AND idempresa = $${params.length + 1}`;
        params.push(parseInt(idempresa));
      }

      query += ` ORDER BY posicao, indicador`;

      const result = await prisma.$queryRawUnsafe(query, ...params);
      
      // Converter valores para número
      const resultWithNumbers = (result as any[]).map(item => ({
        ...item,
        meta: parseFloat(item.meta) || 0,
        realizado: parseFloat(item.realizado) || 0,
        variacao: parseFloat(item.variacao) || 0,
        datacriacao: item.datacriacao?.toISOString?.() || item.datacriacao
      }));
      
      return reply.send(resultWithNumbers);
    } catch (error) {
      console.error("❌ Erro em /indicadores:", error);
      return reply.status(500).send({ error: "Erro ao buscar indicadores" });
    }
  });

  // Rota para buscar dias disponíveis
  fastify.get("/indicadores/dias", {
    preValidation: [fastify.authenticate], // ✅ exige token JWT
  }, async (request, reply) => {
    try {
      const user = request.user as any;
      const idorganizacao = user?.idorganizacao;

      if (!idorganizacao) {
        return reply.status(401).send({ error: "Token inválido ou sem idorganizacao." });
      }

      const query = `
        SELECT DISTINCT dia, datacriacao
        FROM indicadores 
        WHERE idorganizacao = $1 
        AND ativo = true
        ORDER BY dia DESC
      `;

      const result = await prisma.$queryRawUnsafe(query, idorganizacao);
      
      const diasFormatados = (result as any[]).map(item => ({
        dia: item.dia,
        datacriacao: item.datacriacao?.toISOString?.() || item.datacriacao
      }));
      
      return reply.send(diasFormatados);
    } catch (error) {
      console.error("❌ Erro em /indicadores/dias:", error);
      return reply.status(500).send({ error: "Erro ao buscar dias disponíveis" });
    }
  });

  // Rota para buscar empresas disponíveis
  fastify.get("/indicadores/empresas", {
    preValidation: [fastify.authenticate], // ✅ exige token JWT
  }, async (request, reply) => {
    try {
      const user = request.user as any;
      const idorganizacao = user?.idorganizacao;

      if (!idorganizacao) {
        return reply.status(401).send({ error: "Token inválido ou sem idorganizacao." });
      }

      const query = `
        SELECT DISTINCT idempresa, nomeempresa
        FROM indicadores 
        WHERE idorganizacao = $1 
        AND ativo = true
        ORDER BY nomeempresa
      `;

      const result = await prisma.$queryRawUnsafe(query, idorganizacao);
      
      return reply.send(result);
    } catch (error) {
      console.error("❌ Erro em /indicadores/empresas:", error);
      return reply.status(500).send({ error: "Erro ao buscar empresas disponíveis" });
    }
  });
}
