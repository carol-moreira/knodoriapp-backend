-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'JOINER');

-- CreateEnum
CREATE TYPE "CegStatus" AS ENUM ('ABERTA', 'FECHADA', 'EM_COMPRA', 'EM_TRANSITO_INTER', 'EM_TRANSITO_BR', 'RECEBIDA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "LogisticStatus" AS ENUM ('AGUARDANDO', 'PROXY_RECEBEU', 'ENVIADO_INTER', 'CHEGOU_BR', 'EM_SEPARACAO', 'ENVIADO_JOINERS');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('KRW', 'JPY', 'USD', 'IDR', 'BRL');

-- CreateEnum
CREATE TYPE "PagamentoStatus" AS ENUM ('PENDENTE', 'PAGO_PARCIAL', 'PAGO', 'ATRASADO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "EnvioStatus" AS ENUM ('AGUARDANDO', 'PRONTO_ENVIO', 'ENVIADO', 'ENTREGUE', 'EXTRAVIADO');

-- CreateEnum
CREATE TYPE "MercariStatus" AS ENUM ('WISHLIST', 'SOLICITADO', 'COMPRADO', 'ENTREGUE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'JOINER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CegGeral" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "organizador" TEXT NOT NULL,
    "lojaProxy" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "status" "CegStatus" NOT NULL DEFAULT 'ABERTA',
    "statusLogistico" "LogisticStatus" NOT NULL DEFAULT 'AGUARDANDO',
    "prazo" TIMESTAMP(3),
    "qtdItens" INTEGER NOT NULL DEFAULT 0,
    "moedaOriginal" "Currency" NOT NULL,
    "valorOriginal" DECIMAL(14,2) NOT NULL,
    "cotacaoFechada" DECIMAL(14,6) NOT NULL,
    "taxaProxy" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "freteInterTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "pesoCaixaKg" DECIMAL(8,3),
    "valorFreteBR" DECIMAL(14,2),
    "impostoRF" DECIMAL(14,2),
    "custoEmbalagem" DECIMAL(14,2),
    "dataCompra" TIMESTAMP(3),
    "dataEnvioBR" TIMESTAMP(3),
    "dataChegadaBR" TIMESTAMP(3),
    "dataRecebimento" TIMESTAMP(3),
    "rastreioAddy" TEXT,
    "rastreioInter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CegGeral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CegUnidade" (
    "id" TEXT NOT NULL,
    "cegId" TEXT NOT NULL,
    "joinerId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "pagamentoStatus" "PagamentoStatus" NOT NULL DEFAULT 'PENDENTE',
    "taxaAtraso" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "prazoPagamento" TIMESTAMP(3),
    "freteInterUnidade" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "fretePagoStatus" "PagamentoStatus" NOT NULL DEFAULT 'PENDENTE',
    "taxaRFUnidade" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxaRFPagoStatus" "PagamentoStatus" NOT NULL DEFAULT 'PENDENTE',
    "prazoFretePagamento" TIMESTAMP(3),
    "cep" TEXT,
    "endereco" TEXT,
    "envioStatus" "EnvioStatus" NOT NULL DEFAULT 'AGUARDANDO',
    "rastreioNacional" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CegUnidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MercariWishlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT,
    "imagemUrl" TEXT,
    "precoJpy" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MercariWishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MercariRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nomeItem" TEXT NOT NULL,
    "valorJpy" DECIMAL(14,2) NOT NULL,
    "valorBrl" DECIMAL(14,2),
    "status" "MercariStatus" NOT NULL DEFAULT 'SOLICITADO',
    "comprovante" TEXT,
    "imagemUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MercariRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentProof" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contexto" TEXT NOT NULL,
    "arquivoUrl" TEXT NOT NULL,
    "valor" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "CegUnidade" ADD CONSTRAINT "CegUnidade_cegId_fkey" FOREIGN KEY ("cegId") REFERENCES "CegGeral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CegUnidade" ADD CONSTRAINT "CegUnidade_joinerId_fkey" FOREIGN KEY ("joinerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercariWishlistItem" ADD CONSTRAINT "MercariWishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercariRequest" ADD CONSTRAINT "MercariRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
