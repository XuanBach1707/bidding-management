import { z } from "zod";

// --- SCHEDULE SCHEMA ---
export const scheduleSchema = z.object({
  id: z.number().optional(),
  sourceUrl: z.string().url("URL nguồn không hợp lệ").min(1, "URL nguồn là bắt buộc"),
  cronExpression: z.string().min(1, "Cron expression là bắt buộc"),
  description: z.string().optional().default(""),
  isActive: z.boolean().default(true),
});

export type Schedule = z.infer<typeof scheduleSchema>;

// --- RULE SCHEMA (Đã fix các lỗi catch/coerce) ---
export const ruleSchema = z.object({
  id: z.number().optional(),
  ruleName: z.string().min(1, "Tên luật không được để trống"),
  businessField: z.string().min(1, "Lĩnh vực kinh doanh là bắt buộc"),
  
  // Mảng string mặc định rỗng
  keywordsInclude: z.array(z.string()).default([]),
  keywordsExclude: z.array(z.string()).default([]),
  
  // Xử lý số: Nếu input rỗng hoặc lỗi -> về 0
  minBudget: z.coerce.number().min(0).default(0).catch(0), 
  maxBudget: z.coerce.number().min(0).default(0).catch(0), 
  
  locations: z.array(z.string()).default([]),
  
  // Bổ sung đầy đủ trường để khớp với Form
  investor: z.array(z.string()).default([]),
  commune: z.array(z.string()).default([]),

  priority: z.coerce.number().int().min(1).default(1).catch(1),
});

// Type này sẽ được dùng trong useForm<Rule>
export type Rule = z.infer<typeof ruleSchema>;