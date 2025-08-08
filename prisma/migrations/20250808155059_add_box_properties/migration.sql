-- AlterTable
ALTER TABLE "public"."templates" ADD COLUMN     "boxBorderColor" TEXT,
ADD COLUMN     "boxBorderRadius" INTEGER,
ADD COLUMN     "boxBorderWidth" INTEGER,
ADD COLUMN     "boxColor" TEXT,
ADD COLUMN     "boxEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "boxPadding" INTEGER,
ADD COLUMN     "boxShadowBlur" INTEGER,
ADD COLUMN     "boxShadowColor" TEXT,
ADD COLUMN     "boxShadowEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "boxShadowOffsetX" INTEGER,
ADD COLUMN     "boxShadowOffsetY" INTEGER;
