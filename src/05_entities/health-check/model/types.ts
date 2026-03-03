import { z } from "zod";
import { 
  HealthCheckDetailSchema, 
  HealthCheckCategorySchema, 
  HealthCheckResponseSchema 
} from "./schemas";

export type HealthCheckDetail = z.infer<typeof HealthCheckDetailSchema>;
export type HealthCheckCategory = z.infer<typeof HealthCheckCategorySchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;