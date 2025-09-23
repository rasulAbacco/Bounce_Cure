/*
  Warnings:

  - The primary key for the `Verification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Verification` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "public"."SupportFile" DROP CONSTRAINT "SupportFile_ticketId_fkey";

-- DropIndex
DROP INDEX "public"."Contact_email_key";

-- AlterTable
ALTER TABLE "public"."Contact" ADD COLUMN     "company" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last" TEXT,
ADD COLUMN     "priority" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."Verification" DROP CONSTRAINT "Verification_pkey",
ADD COLUMN     "mx" TEXT[],
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "usedFallback" BOOLEAN,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "catch_all" DROP NOT NULL,
ALTER COLUMN "mailbox_exists" DROP NOT NULL,
ALTER COLUMN "score" DROP NOT NULL,
ALTER COLUMN "syntax_valid" DROP NOT NULL,
ADD CONSTRAINT "Verification_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "due" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Deal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "closing" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Email" (
    "id" SERIAL NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "accountId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailAccount" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "imapHost" TEXT NOT NULL,
    "imapPort" INTEGER NOT NULL,
    "imapUser" TEXT NOT NULL,
    "encryptedPass" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reply" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lead" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "campaign" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "last" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."List" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedFile" BYTEA,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "orderCode" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "plan" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL DEFAULT 0,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "id" SERIAL NOT NULL,
    "subject" TEXT,
    "snippet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER,
    "body" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "fromName" TEXT,
    "fromEmail" TEXT,
    "direction" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationBatch" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "source" TEXT NOT NULL,
    "includeOnlyValid" BOOLEAN NOT NULL DEFAULT false,
    "maxRich" BOOLEAN NOT NULL DEFAULT false,
    "total" INTEGER NOT NULL,
    "validCount" INTEGER NOT NULL,
    "invalidCount" INTEGER NOT NULL,
    "riskyCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BatchResult" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "syntax_valid" BOOLEAN NOT NULL,
    "domain_valid" BOOLEAN NOT NULL,
    "mailbox_exists" BOOLEAN,
    "catch_all" BOOLEAN,
    "disposable" BOOLEAN NOT NULL,
    "role_based" BOOLEAN NOT NULL,
    "greylisted" BOOLEAN NOT NULL,
    "mx" TEXT[],
    "provider" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "public"."Lead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "public"."Order"("orderCode");

-- CreateIndex
CREATE INDEX "VerificationBatch_createdAt_idx" ON "public"."VerificationBatch"("createdAt");

-- CreateIndex
CREATE INDEX "BatchResult_email_idx" ON "public"."BatchResult"("email");

-- CreateIndex
CREATE INDEX "Verification_email_idx" ON "public"."Verification"("email");

-- AddForeignKey
ALTER TABLE "public"."SupportFile" ADD CONSTRAINT "SupportFile_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Email" ADD CONSTRAINT "Email_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."EmailAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAccount" ADD CONSTRAINT "EmailAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reply" ADD CONSTRAINT "Reply_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BatchResult" ADD CONSTRAINT "BatchResult_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."VerificationBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
