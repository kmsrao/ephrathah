-- AlterTable
ALTER TABLE "users" ADD COLUMN     "submitAccountabilityEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "submitFeedbackEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "watchLiveEnabled" BOOLEAN NOT NULL DEFAULT false;
