export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH";


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
