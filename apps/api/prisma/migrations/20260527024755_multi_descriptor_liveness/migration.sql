-- CreateTable
CREATE TABLE "face_descriptors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "descriptor" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "face_descriptors_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_people" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "documentPath" TEXT,
    "faceDescriptor" TEXT NOT NULL,
    "livenessValidated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_people" ("createdAt", "documentPath", "externalId", "faceDescriptor", "id", "imagePath", "name", "updatedAt") SELECT "createdAt", "documentPath", "externalId", "faceDescriptor", "id", "imagePath", "name", "updatedAt" FROM "people";
DROP TABLE "people";
ALTER TABLE "new_people" RENAME TO "people";
CREATE UNIQUE INDEX "people_externalId_key" ON "people"("externalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "face_descriptors_personId_idx" ON "face_descriptors"("personId");
