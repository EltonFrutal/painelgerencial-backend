// server-fastify.js

const path = require('path');
require('ts-node').register(); // Permite importar arquivos TypeScript
require('tsconfig-paths').register(); // Resolve paths como @/lib
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Carrega variáveis .env

require('./src/index.ts'); // Aponta para o servidor principal escrito em TypeScript
