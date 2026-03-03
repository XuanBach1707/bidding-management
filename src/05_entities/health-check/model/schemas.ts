import { z } from "zod";

export const HealthCheckDetailSchema = z.object({
  criteriaName: z.string(),
  requiredValue: z.string(),
  actualValue: z.string(),
  status: z.string(),
  note: z.string(),
});

export const HealthCheckCategorySchema = z.object({
  categoryName: z.string(),
  status: z.string(),
  details: z.array(HealthCheckDetailSchema),
});

export const HealthCheckResponseSchema = z.object({
  hsmtId: z.number(),
  overallStatus: z.string(),
  score: z.number(),
  categories: z.array(HealthCheckCategorySchema),
});