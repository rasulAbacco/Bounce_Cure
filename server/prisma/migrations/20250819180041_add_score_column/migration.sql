-- AlterTable
ALTER TABLE "public"."Verification" ADD COLUMN     "bounced" BOOLEAN DEFAULT false,
ADD COLUMN     "catch_all" BOOLEAN,
ADD COLUMN     "disposable" BOOLEAN,
ADD COLUMN     "domain_valid" BOOLEAN,
ADD COLUMN     "greylisted" BOOLEAN,
ADD COLUMN     "mailbox_exists" BOOLEAN,
ADD COLUMN     "role_based" BOOLEAN,
ADD COLUMN     "score" INTEGER,
ADD COLUMN     "syntax_valid" BOOLEAN;
