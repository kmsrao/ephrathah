-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'INCHARGE', 'MEMBER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMBER';
