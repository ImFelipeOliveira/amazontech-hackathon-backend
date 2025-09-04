import { z } from "zod";

export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().min(1),
  data: z.any().optional(),
  timestamp: z.iso.datetime(),
});

export const ErrorResponseSchema = z.object({
  error: z.string().min(1),
});

export const PaginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
  timestamp: z.iso.datetime(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const DateRangeSchema = z.object({
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "startDate must be before or equal to endDate",
  path: ["startDate"],
});

export const SortSchema = z.object({
  sortBy: z.string().min(1).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const HealthCheckResponseSchema = z.object({
  status: z.enum(["healthy", "unhealthy"]),
  timestamp: z.iso.datetime(),
  version: z.string().min(1),
  services: z.object({
    database: z.enum(["connected", "disconnected"]),
    ai: z.enum(["available", "unavailable"]),
  }),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type Sort = z.infer<typeof SortSchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
