/*
  Warnings:

  - You are about to drop the column `anxietyManagement` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the column `motivationSource` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the column `opinionImportance` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the column `stressFrequency` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the column `unexpectedReaction` on the `Survey` table. All the data in the column will be lost.
  - Added the required column `diagnosticResults` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wellbeingResponses` to the `Survey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Survey" DROP COLUMN "anxietyManagement",
DROP COLUMN "motivationSource",
DROP COLUMN "opinionImportance",
DROP COLUMN "stressFrequency",
DROP COLUMN "unexpectedReaction",
ADD COLUMN     "diagnosticResults" JSONB NOT NULL DEFAULT '{"who5Score": 0, "who5Result": "No disponible", "mhi5Score": 0, "mhi5Result": "No disponible"}',
ADD COLUMN     "wellbeingResponses" JSONB NOT NULL DEFAULT '{"cheerful": "0", "calm": "0", "active": "0", "rested": "0", "interesting": "0", "depressed": "0", "anxious": "0", "hopeless": "0", "peaceful": "0", "happy": "0"}';

-- After migration, remove the default constraints since we want these to be required
ALTER TABLE "Survey" ALTER COLUMN "diagnosticResults" DROP DEFAULT,
ALTER COLUMN "wellbeingResponses" DROP DEFAULT;
