/*
  Warnings:

  - The primary key for the `Verification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `checkedAt` on the `Verification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Verification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `catch_all` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disposable` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domain_valid` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `greylisted` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mailbox_exists` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_based` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `syntax_valid` to the `Verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Verification" DROP CONSTRAINT "Verification_pkey",
DROP COLUMN "checkedAt",
ADD COLUMN     "catch_all" BOOLEAN NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "disposable" BOOLEAN NOT NULL,
ADD COLUMN     "domain_valid" BOOLEAN NOT NULL,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "greylisted" BOOLEAN NOT NULL,
ADD COLUMN     "mailbox_exists" BOOLEAN NOT NULL,
ADD COLUMN     "role_based" BOOLEAN NOT NULL,
ADD COLUMN     "score" INTEGER NOT NULL,
ADD COLUMN     "syntax_valid" BOOLEAN NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Verification_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Verification_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Verification_email_key" ON "public"."Verification"("email");
