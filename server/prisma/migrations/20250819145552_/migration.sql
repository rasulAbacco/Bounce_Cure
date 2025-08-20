/*
  Warnings:

  - You are about to drop the column `status` on the `SupportTicket` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SupportTicket" DROP COLUMN "status",
ADD COLUMN     "userEmail" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."SupportFile" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" INTEGER NOT NULL,

    CONSTRAINT "SupportFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SupportFile" ADD CONSTRAINT "SupportFile_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."SupportTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
