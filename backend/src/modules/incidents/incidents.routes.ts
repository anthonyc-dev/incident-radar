import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { authentication } from "../../shared/middleware/auth.middleware.js";
import { incidentsController } from "./incidents.controller.js";
import {
  getIncidentsSchema,
  createIncidentSchema,
  getIncidentByIdSchema,
  updateIncidentSchema,
  deleteIncidentSchema,
  updateStatusSchema,
  getStatusHistorySchema,
} from "./incidents.schema.js";

const router = Router();

// All routes require authentication
router.use(authentication);

// GET /api/incidents - Get all incidents (with optional filtering)
router.get(
  "/",
  validate(getIncidentsSchema),
  incidentsController.getIncidents.bind(incidentsController)
);

// POST /api/incidents - Create new incident
router.post(
  "/",
  validate(createIncidentSchema),
  incidentsController.createIncident.bind(incidentsController)
);

// GET /api/incidents/:id - Get single incident
router.get(
  "/:id",
  validate(getIncidentByIdSchema),
  incidentsController.getIncidentById.bind(incidentsController)
);

// PUT /api/incidents/:id - Update incident
router.put(
  "/:id",
  validate(updateIncidentSchema),
  incidentsController.updateIncident.bind(incidentsController)
);

// DELETE /api/incidents/:id - Delete incident
router.delete(
  "/:id",
  validate(deleteIncidentSchema),
  incidentsController.deleteIncident.bind(incidentsController)
);

// POST /api/incidents/:id/status - Update incident status
router.post(
  "/:id/status",
  validate(updateStatusSchema),
  incidentsController.updateStatus.bind(incidentsController)
);

// GET /api/incidents/:id/history - Get status history
router.get(
  "/:id/history",
  validate(getStatusHistorySchema),
  incidentsController.getStatusHistory.bind(incidentsController)
);

export default router;
