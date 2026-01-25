import { z } from "zod";

/* ===============================
   Reusable primitives (DRY)
================================ */

const titleSchema = z
  .string()
  .min(1, "Title is required")
  .max(200, "Title must be at most 200 characters")
  .trim();

const descriptionSchema = z
  .string()
  .min(1, "Description is required")
  .max(5000, "Description must be at most 5000 characters")
  .trim();

const severitySchema = z.enum(["LOW", "MEDIUM", "HIGH"], {
  message: "Severity must be LOW, MEDIUM, or HIGH",
});

const statusSchema = z.enum(["OPEN", "INVESTIGATING", "RESOLVED"], {
  message: "Status must be OPEN, INVESTIGATING, or RESOLVED",
});

const uuidSchema = z
  .string()
  .uuid("Invalid ID format")
  .min(1, "ID is required");

/* ===============================
   Schemas
================================ */

// GET /api/incidents - Query params for filtering
export const getIncidentsSchema = z.object({
  query: z.object({
    status: statusSchema.optional(),
    severity: severitySchema.optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, { message: "Page must be greater than 0" }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),
  }),
});

// POST /api/incidents - Create incident
export const createIncidentSchema = z.object({
  body: z.object({
    title: titleSchema,
    description: descriptionSchema,
    severity: severitySchema,
  }),
});

// GET /api/incidents/:id - Get single incident
export const getIncidentByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// PUT /api/incidents/:id - Update incident
export const updateIncidentSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    severity: severitySchema.optional(),
  }),
});

// DELETE /api/incidents/:id - Delete incident
export const deleteIncidentSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// POST /api/incidents/:id/status - Update status
export const updateStatusSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    newStatus: statusSchema,
  }),
});

// GET /api/incidents/:id/history - Get status history
export const getStatusHistorySchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// GET /api/incidents/:id/activity - Get activity history
export const getActivityHistorySchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});
