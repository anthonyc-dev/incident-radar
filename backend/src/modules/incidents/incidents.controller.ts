import { type Request, type Response } from "express";
import { incidentsService } from "./incidents.service.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import type { IncidentSeverity, IncidentStatus } from "../../generated/prisma/enums.js";

export class IncidentsController {
  // ---------------- GET ALL INCIDENTS ----------------
  async getIncidents(req: Request, res: Response): Promise<void> {
    try {
      const query: {
        status?: IncidentStatus;
        severity?: IncidentSeverity;
        page?: number;
        limit?: number;
      } = {};

      // Zod validation ensures these are valid enum values if present
      if (typeof req.query.status === "string") {
        query.status = req.query.status as IncidentStatus;
      }
      if (typeof req.query.severity === "string") {
        query.severity = req.query.severity as IncidentSeverity;
      }
      if (typeof req.query.page === "number") {
        query.page = req.query.page;
      } else if (typeof req.query.page === "string") {
        query.page = parseInt(req.query.page, 10);
      }
      if (typeof req.query.limit === "number") {
        query.limit = req.query.limit;
      } else if (typeof req.query.limit === "string") {
        query.limit = parseInt(req.query.limit, 10);
      }

      // Optional: filter by current user if needed
      const userId = req.user?.sub;

      const result = await incidentsService.getIncidents(query, userId);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  }

  // ---------------- GET INCIDENT BY ID ----------------
  async getIncidentById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const incident = await incidentsService.getIncidentById(id);
      res.status(200).json(incident);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Failed to fetch incident" });
    }
  }

  // ---------------- CREATE INCIDENT ----------------
  async createIncident(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, severity } = req.body;
      const userId = req.user?.sub;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const incident = await incidentsService.createIncident({
        title,
        description,
        severity,
        createdBy: userId,
      });

      res.status(201).json(incident);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Failed to create incident" });
    }
  }

  // ---------------- UPDATE INCIDENT ----------------
  async updateIncident(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { title, description, severity } = req.body;

      const incident = await incidentsService.updateIncident(id, {
        title,
        description,
        severity,
      });

      res.status(200).json(incident);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Failed to update incident" });
    }
  }

  // ---------------- DELETE INCIDENT ----------------
  async deleteIncident(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await incidentsService.deleteIncident(id);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Failed to delete incident" });
    }
  }

  // ---------------- UPDATE STATUS ----------------
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { newStatus } = req.body;
      const userId = req.user?.sub;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const incident = await incidentsService.updateStatus({
        incidentId: id,
        newStatus: newStatus as IncidentStatus,
        changedBy: userId,
      });

      res.status(200).json(incident);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Failed to update status" });
    }
  }

  // ---------------- GET STATUS HISTORY ----------------
  async getStatusHistory(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const history = await incidentsService.getStatusHistory(id);
      res.status(200).json(history);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Failed to fetch status history" });
    }
  }
}

export const incidentsController = new IncidentsController();
