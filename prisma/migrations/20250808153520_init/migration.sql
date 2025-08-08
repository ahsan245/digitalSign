-- CreateTable
CREATE TABLE "public"."templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "quality" INTEGER NOT NULL DEFAULT 80,
    "format" TEXT NOT NULL DEFAULT 'jpeg',
    "resizeMode" TEXT NOT NULL DEFAULT 'cover',
    "fit" TEXT NOT NULL DEFAULT 'cover',
    "cropMode" TEXT,
    "cropX" INTEGER,
    "cropY" INTEGER,
    "cropWidth" INTEGER,
    "cropHeight" INTEGER,
    "brightness" DOUBLE PRECISION,
    "contrast" DOUBLE PRECISION,
    "saturation" DOUBLE PRECISION,
    "hue" DOUBLE PRECISION,
    "blur" DOUBLE PRECISION,
    "sharpen" DOUBLE PRECISION,
    "watermarkEnabled" BOOLEAN NOT NULL DEFAULT false,
    "watermarkText" TEXT,
    "watermarkPosition" TEXT,
    "watermarkOpacity" DOUBLE PRECISION,
    "watermarkSize" INTEGER,
    "backgroundColor" TEXT,
    "backgroundBlur" BOOLEAN NOT NULL DEFAULT false,
    "progressive" BOOLEAN NOT NULL DEFAULT true,
    "optimizeScans" BOOLEAN NOT NULL DEFAULT true,
    "stripMetadata" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."uploads" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "processedPath" TEXT,
    "processedUrl" TEXT,
    "cloudinaryId" TEXT,
    "cloudinaryUrl" TEXT,
    "originalWidth" INTEGER,
    "originalHeight" INTEGER,
    "processedWidth" INTEGER,
    "processedHeight" INTEGER,
    "templateId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "templates_name_key" ON "public"."templates"("name");

-- AddForeignKey
ALTER TABLE "public"."uploads" ADD CONSTRAINT "uploads_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
