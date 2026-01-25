-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED');

-- CreateTable
CREATE TABLE "Incidents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "created_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentStatusLogs" (
    "id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "old_status" "IncidentStatus" NOT NULL,
    "new_status" "IncidentStatus" NOT NULL,
    "changed_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentStatusLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incidents_id_idx" ON "Incidents"("id");

-- CreateIndex
CREATE INDEX "Incidents_status_idx" ON "Incidents"("status");

-- CreateIndex
CREATE INDEX "Incidents_severity_idx" ON "Incidents"("severity");

-- CreateIndex
CREATE INDEX "IncidentStatusLogs_id_idx" ON "IncidentStatusLogs"("id");

-- AddForeignKey
ALTER TABLE "Incidents" ADD CONSTRAINT "Incidents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentStatusLogs" ADD CONSTRAINT "IncidentStatusLogs_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "Incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentStatusLogs" ADD CONSTRAINT "IncidentStatusLogs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
