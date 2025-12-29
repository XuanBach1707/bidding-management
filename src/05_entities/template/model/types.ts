import { z } from "zod";
import { TemplateSchema } from "./schemas";

// Tự động sinh type TypeScript từ Schema Zod
export type Template = z.infer<typeof TemplateSchema>;