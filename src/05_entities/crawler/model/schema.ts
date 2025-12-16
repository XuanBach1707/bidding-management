import { z } from "zod";

// --- SCHEDULE ---
export const scheduleSchema = z.object({
  id: z.number().optional(), // ID là number
  sourceUrl: z.string().url("URL nguồn không hợp lệ").min(1, "URL nguồn là bắt buộc"),
  cronExpression: z.string().min(1, "Cron expression là bắt buộc"),
  description: z.string().optional().default(""),
  isActive: z.boolean().default(true), // is_active
});

export type Schedule = z.infer<typeof scheduleSchema>;

// --- RULE ---
export const ruleSchema = z.object({
  id: z.number().optional(),
  ruleName: z.string().min(1, "Tên luật không được để trống"), // rule_name
  businessField: z.string().min(1, "Lĩnh vực kinh doanh là bắt buộc"), // business_field
  
  // Array strings: mặc định là mảng rỗng nếu không có dữ liệu
  keywordsInclude: z.array(z.string()).default([]), // keywords_include
  keywordsExclude: z.array(z.string()).default([]), // keywords_exclude
  
  // Dùng coerce để ép kiểu string/number từ input form thành number chuẩn
  minBudget: z.coerce.number().min(0).default(0), // min_budget
  maxBudget: z.coerce.number().min(0).default(0), // max_budget
  
  locations: z.array(z.string()).default([]),
  priority: z.coerce.number().int().min(1).default(1),
  
});

export type Rule = z.infer<typeof ruleSchema>;

// --- API RESPONSE WRAPPER ---
// Type chung cho response trả về từ BE của bạn
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

// Status type
export type CrawlerLogStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | string;

// Base Log Interface
export interface CrawlerLogBase {
  id: number;
  ruleId: number; // API trả về rule_id -> Interceptor đổi thành ruleId
  ruleName: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  status: CrawlerLogStatus;
  packagesFound: number;
  errorMessage: string;
}

// 1. Type cho danh sách Logs
export interface CrawlerLogListItem extends CrawlerLogBase {}

// 2. Type cho chi tiết Log
export interface CrawlerLogDetail extends CrawlerLogBase {
  // Tái sử dụng Rule Type bạn đã define bằng Zod
  // Lưu ý: Đảm bảo dữ liệu từ API trả về khớp kiểu dữ liệu với Rule type (vd: minBudget là number)
  rule: Rule; 
}

// Params để lọc log
export interface GetCrawlerLogsParams {
  status?: CrawlerLogStatus;
  ruleId?: number;
}