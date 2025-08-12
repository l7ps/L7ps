-- CreateTable
CREATE TABLE "Partner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "remoteId" TEXT NOT NULL,
    "name" TEXT,
    "fantasyName" TEXT,
    "document" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "specialty" TEXT,
    "sourceUpdatedAt" DATETIME,
    "sourceHash" TEXT,
    "raw" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Partner_remoteId_key" ON "Partner"("remoteId");

-- CreateIndex
CREATE INDEX "Partner_city_idx" ON "Partner"("city");

-- CreateIndex
CREATE INDEX "Partner_state_idx" ON "Partner"("state");

-- CreateIndex
CREATE INDEX "Partner_specialty_idx" ON "Partner"("specialty");

-- CreateIndex
CREATE INDEX "Partner_document_idx" ON "Partner"("document");
