-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "jpstudy_word" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "wordType" TEXT NOT NULL,
    "subType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jpstudy_word_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jpstudy_word_wordType_idx" ON "jpstudy_word"("wordType");

-- CreateIndex
CREATE INDEX "jpstudy_word_wordType_subType_idx" ON "jpstudy_word"("wordType", "subType");

