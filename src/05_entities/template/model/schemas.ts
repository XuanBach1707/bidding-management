import { z } from "zod";

export const TemplateSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(), // Chứa HTML
  category: z.string(), // Ví dụ: "TECH", "LEGAL"...
  description: z.string().optional().default(""), // Có thể API trả về null hoặc thiếu
  isActive: z.boolean().default(true), // Interceptor đã đổi is_active -> isActive
});