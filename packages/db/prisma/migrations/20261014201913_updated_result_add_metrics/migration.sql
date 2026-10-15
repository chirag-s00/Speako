/*
  Warnings:

  - Added the required column `metrics` to the `results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "results" ADD COLUMN     "metrics" JSONB NOT NULL;
