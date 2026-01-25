import { prisma } from "../../config/db.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import type { IncidentSeverity, IncidentStatus } from "../../generated/prisma/enums.js";

export interface CreateIncidentInput {
  title: string;
  description: string;
  severity: IncidentSeverity;
  createdBy: string;
}

export interface UpdateIncidentInput {
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
}

export interface UpdateStatusInput {
  incidentId: string;
  newStatus: IncidentStatus;
  changedBy: string;
}

export interface GetIncidentsQuery {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  page?: number;
  limit?: number;
}

export interface StatusHistoryEntry {
  oldStatus: IncidentStatus;
  newStatus: IncidentStatus;
  changed_by: string;
  changedAt: Date;
  changedByName: string;
}

export class IncidentsService {
  // ---------------- GET ALL INCIDENTS ----------------
  async getIncidents(query: GetIncidentsQuery, userId?: string) {
    const {
      status,
      severity,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const where: {
      status?: IncidentStatus;
      severity?: IncidentSeverity;
      created_by?: string;
    } = {};

    if (status) {
      where.status = status;
    }

    if (severity) {
      where.severity = severity;
    }


    if (userId) {
      where.created_by = userId;
    }

    const [incidents, total] = await Promise.all([
      prisma.incidents.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.incidents.count({ where }),
    ]);

    return {
      incidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ---------------- GET INCIDENT BY ID ----------------
  async getIncidentById(id: string) {
    const incident = await prisma.incidents.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!incident) {
      throw new ApiError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    }

    return incident;
  }

  // ---------------- CREATE INCIDENT ----------------
  async createIncident(input: CreateIncidentInput) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: input.createdBy },
    });

    if (!user) {
      throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }

    const incident = await prisma.incidents.create({
      data: {
        title: input.title,
        description: input.description,
        severity: input.severity,
        status: "OPEN",
        created_by: input.createdBy,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return incident;
  }

  // ---------------- UPDATE INCIDENT ----------------
  async updateIncident(id: string, input: UpdateIncidentInput) {
    // Check if incident exists
    const existingIncident = await prisma.incidents.findUnique({
      where: { id },
    });

    if (!existingIncident) {
      throw new ApiError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    }

    const incident = await prisma.incidents.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description && { description: input.description }),
        ...(input.severity && { severity: input.severity }),
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return incident;
  }

  // ---------------- DELETE INCIDENT ----------------
  async deleteIncident(id: string) {
    const incident = await prisma.incidents.findUnique({
      where: { id },
    });

    if (!incident) {
      throw new ApiError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    }

    await prisma.incidentStatusLogs.deleteMany({
      where: { incident_id: id },
    });


    await prisma.incidents.delete({
      where: { id },
    });

    return { message: "Incident deleted successfully" };
  }

  // ---------------- UPDATE STATUS ----------------
  async updateStatus(input: UpdateStatusInput) {
    const { incidentId, newStatus, changedBy } = input;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: changedBy },
    });

    if (!user) {
      throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }

    // Get current incident
    const incident = await prisma.incidents.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new ApiError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    }

    const oldStatus = incident.status;

    // If status hasn't changed, return current incident
    if (oldStatus === newStatus) {
      return await this.getIncidentById(incidentId);
    }

    // Update status and create log in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update incident status
      const updatedIncident = await tx.incidents.update({
        where: { id: incidentId },
        data: { status: newStatus },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create status log entry
      await tx.incidentStatusLogs.create({
        data: {
          incident_id: incidentId,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: changedBy,
        },
      });

      return updatedIncident;
    });

    return result;
  }

  // ---------------- GET STATUS HISTORY ----------------
  async getStatusHistory(id: string): Promise<StatusHistoryEntry[]> {

    const incident = await prisma.incidents.findUnique({
      where: { id },
    });

    if (!incident) {
      throw new ApiError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    }

    const logs = await prisma.incidentStatusLogs.findMany({
      where: { incident_id: id },
      orderBy: { createdAt: "asc" },
      include: {
        User: {
          select: {
            name: true,
          },
        },
      },
    });

    return logs.map((log) => ({
      oldStatus: log.old_status,
      newStatus: log.new_status,
      changed_by: log.changed_by,
      changedAt: log.createdAt,
      changedByName: log.User?.name ?? "Unknown",
    }));
  }
}

export const incidentsService = new IncidentsService();
