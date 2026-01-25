import { prisma } from "../../config/db.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { IncidentSeverity, IncidentStatus } from "./incidents.types.js";

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

export interface ActivityLogEntry {
  id: string;
  activity_type: string;
  performed_by: string;
  performedByName: string;
  description: string | null;
  metadata: string | null;
  createdAt: Date;
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

    const incident = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create incident
      const newIncident = await tx.incidents.create({
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

      // Log creation activity
      await tx.incidentActivityLogs.create({
        data: {
          incident_id: newIncident.id,
          activity_type: "CREATED",
          performed_by: input.createdBy,
          description: `Incident "${input.title}" was created`,
          metadata: JSON.stringify({
            severity: input.severity,
            status: "OPEN",
          }),
        },
      });

      return newIncident;
    });

    return incident;
  }

  // ---------------- UPDATE INCIDENT ----------------
  async updateIncident(id: string, input: UpdateIncidentInput, updatedBy?: string) {
    // Check if incident exists
    const existingIncident = await prisma.incidents.findUnique({
      where: { id },
    });

    if (!existingIncident) {
      throw new ApiError(404, "Incident not found", "INCIDENT_NOT_FOUND");
    }

    // Track changes
    const changes: string[] = [];
    const metadata: Record<string, any> = {};

    if (input.title && input.title !== existingIncident.title) {
      changes.push(`title changed from "${existingIncident.title}" to "${input.title}"`);
      metadata.title = { old: existingIncident.title, new: input.title };
    }

    if (input.description && input.description !== existingIncident.description) {
      changes.push("description was updated");
      metadata.description = { updated: true };
    }

    if (input.severity && input.severity !== existingIncident.severity) {
      changes.push(`severity changed from ${existingIncident.severity} to ${input.severity}`);
      metadata.severity = { old: existingIncident.severity, new: input.severity };
    }

    const incident = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update incident
      const updatedIncident = await tx.incidents.update({
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

      // Log update activity if there are changes and user is provided
      if (changes.length > 0 && updatedBy) {
        await tx.incidentActivityLogs.create({
          data: {
            incident_id: id,
            activity_type: "UPDATED",
            performed_by: updatedBy,
            description: changes.join(", "),
            metadata: JSON.stringify(metadata),
          },
        });
      }

      return updatedIncident;
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

    // Update status and create logs in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

      // Create status log entry (for backward compatibility)
      await tx.incidentStatusLogs.create({
        data: {
          incident_id: incidentId,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: changedBy,
        },
      });

      // Create activity log entry
      const activityType = newStatus === "RESOLVED" ? "RESOLVED" : "STATUS_CHANGED";
      const description = newStatus === "RESOLVED"
        ? `Incident was resolved (status changed from ${oldStatus} to ${newStatus})`
        : `Status changed from ${oldStatus} to ${newStatus}`;

      await tx.incidentActivityLogs.create({
        data: {
          incident_id: incidentId,
          activity_type: activityType,
          performed_by: changedBy,
          description,
          metadata: JSON.stringify({
            oldStatus,
            newStatus,
          }),
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

    return logs.map((log: {
      old_status: IncidentStatus;
      new_status: IncidentStatus;
      changed_by: string;
      createdAt: Date;
      User?: { name?: string | null } | null;
    }) => ({
      oldStatus: log.old_status,
      newStatus: log.new_status,
      changed_by: log.changed_by,
      changedAt: log.createdAt,
      changedByName: log.User?.name ?? "Unknown",
    }));
  }

  // ---------------- GET ACTIVITY HISTORY ----------------
  async getActivityHistory(id: string): Promise<ActivityLogEntry[]> {
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

    // Get all activity logs
    const activityLogs = await prisma.incidentActivityLogs.findMany({
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

    // Build activity history with creation event first
    const activities: ActivityLogEntry[] = [
      {
        id: `creation-${incident.id}`,
        activity_type: "CREATED",
        performed_by: incident.created_by,
        performedByName: incident.User?.name ?? "Unknown",
        description: `Incident "${incident.title}" was created`,
        metadata: JSON.stringify({
          severity: incident.severity,
          status: incident.status,
        }),
        createdAt: incident.createdAt,
      },
      ...activityLogs.map((log: {
        id: string;
        activity_type: string;
        performed_by: string;
        User?: { name?: string | null } | null;
        description: string | null;
        metadata: string | null;
        createdAt: Date;
      }) => ({
        id: log.id,
        activity_type: log.activity_type,
        performed_by: log.performed_by,
        performedByName: log.User?.name ?? "Unknown",
        description: log.description,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
    ];

    return activities;
  }
}

export const incidentsService = new IncidentsService();
