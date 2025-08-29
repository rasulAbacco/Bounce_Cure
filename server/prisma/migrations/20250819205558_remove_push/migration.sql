/*
  Warnings:

  - You are about to drop the column `push` on the `NotificationSetting` table. All the data in the column will be lost.
  - You are about to drop the `PushSubscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PushSubscription" DROP CONSTRAINT "PushSubscription_userId_fkey";

-- AlterTable
ALTER TABLE "public"."NotificationSetting" DROP COLUMN "push";

-- DropTable
DROP TABLE "public"."PushSubscription";
