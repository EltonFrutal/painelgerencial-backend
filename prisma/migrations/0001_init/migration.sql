-- CreateTable
CREATE TABLE "vendas" (
    "idvendas" SERIAL NOT NULL,
    "idorganizacao" INTEGER NOT NULL,
    "organizacao" VARCHAR(100),
    "pedido" VARCHAR(50),
    "cliente" VARCHAR(150),
    "dataemissao" DATE NOT NULL,
    "valorcusto" DECIMAL(12,2),
    "valorvenda" DECIMAL(12,2),
    "valorlucro" DECIMAL(12,2),
    "tipo" VARCHAR(50),
    "vendedor" VARCHAR(100),
    "empresa" VARCHAR(100),

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("idvendas")
);

-- CreateTable
CREATE TABLE "assessor" (
    "id" SERIAL NOT NULL,
    "assessor" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhahash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "admin" BOOLEAN NOT NULL,

    CONSTRAINT "assessor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessororganizacao" (
    "id" SERIAL NOT NULL,
    "idassessor" INTEGER NOT NULL,
    "idorganizacao" INTEGER NOT NULL,

    CONSTRAINT "assessororganizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizacao" (
    "idorganizacao" INTEGER NOT NULL,
    "organizacao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL,

    CONSTRAINT "organizacao_pkey" PRIMARY KEY ("idorganizacao")
);

-- CreateTable
CREATE TABLE "usuario" (
    "idusuario" INTEGER NOT NULL,
    "usuario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhahash" TEXT NOT NULL,
    "idorganizacao" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "vendas" BOOLEAN NOT NULL,
    "areceber" BOOLEAN NOT NULL,
    "apagar" BOOLEAN NOT NULL,
    "historico" BOOLEAN NOT NULL,
    "estoque" BOOLEAN NOT NULL,
    "compras" BOOLEAN NOT NULL,
    "resultados" BOOLEAN NOT NULL,
    "indicador" BOOLEAN NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("idusuario")
);

