// server-fastify.js

const path = require('path');
require('ts-node').register(); // Suporte a TypeScript no Node
require('tsconfig-paths').register(); // Resolve aliases como @/lib
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Carrega variáveis de ambiente

// CORS patch: sobrescreve método register temporariamente para permitir origem da Vercel
const Fastify = require('fastify');
const originalRegister = Fastify.prototype.register;

Fastify.prototype.register = function (plugin, opts = {}) {
  if (
    plugin &&
    plugin.default &&
    plugin.default.name === '@fastify/cors' &&
    process.env.NODE_ENV === 'production'
  ) {
    opts.origin = ['https://painelgerencial.vercel.app'];
    opts.methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    opts.credentials = true;
  }
  return originalRegister.call(this, plugin, opts);
};

// Carrega o servidor principal TypeScript
require('./src/index.ts');
