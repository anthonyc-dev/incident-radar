/**
 * Incidents API client.
 * All endpoints require authentication (cookies via apiClient).
 */

import { apiClient } from "@/lib/api-client";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";

export interface IncidentUser {
  id: string;
  name: string;
  email: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  created_by: string;
  createdAt: string;
  updatedAt: string;
  User: IncidentUser;
}

export interface IncidentsListResponse {
  incidents: Incident[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateIncidentBody {
  title: string;
  description: string;
  severity: IncidentSeverity;
}

export interface UpdateIncidentBody {
  title: string;
  description: string;
  severity: IncidentSeverity;
}

export interface UpdateStatusBody {
  newStatus: IncidentStatus;
}

export interface IncidentHistoryEntry {
  oldStatus: IncidentStatus;
  newStatus: IncidentStatus;
  changed_by: string;
  changedAt: string;
  changedByName: string;
}

const BASE = "/api/incidents";

export const incidentsApi = {
  list: (params?: { page?: number; limit?: number; status?: IncidentStatus; severity?: IncidentSeverity }) =>
    apiClient.get<IncidentsListResponse>(BASE, { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Incident>(`${BASE}/${id}`).then((r) => r.data),

  create: (body: CreateIncidentBody) =>
    apiClient.post<Incident>(BASE, body).then((r) => r.data),

  update: (id: string, body: UpdateIncidentBody) =>
    apiClient.put<Incident>(`${BASE}/${id}`, body).then((r) => r.data),

  updateStatus: (id: string, body: UpdateStatusBody) =>
    apiClient.post<Incident>(`${BASE}/${id}/status`, body).then((r) => r.data),

  getHistory: (id: string) =>
    apiClient.get<IncidentHistoryEntry[]>(`${BASE}/${id}/history`).then((r) => r.data),
};
