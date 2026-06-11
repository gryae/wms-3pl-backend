-- AlterTable: Add sellerAwbNo to outbounds
ALTER TABLE "outbounds" ADD COLUMN "sellerAwbNo" TEXT;

-- AlterTable: Make reason nullable in returns
ALTER TABLE "returns" ALTER COLUMN "reason" DROP NOT NULL;
