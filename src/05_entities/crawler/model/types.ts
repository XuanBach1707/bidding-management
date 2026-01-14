// Import Rule type từ schema để dùng trong CrawlerLogDetail
import type { Rule } from "./schema"; 

// =============================================================================
// API RESPONSE WRAPPER
// =============================================================================
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

// =============================================================================
// CRAWLER LOG TYPES
// =============================================================================

export type CrawlerLogStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | string;

export interface CrawlerLogBase {
  id: number;
  ruleId: number; 
  ruleName: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  status: CrawlerLogStatus;
  packagesFound: number;
  errorMessage: string;
}

// 1. Type cho danh sách Logs (Table)
export interface CrawlerLogListItem extends CrawlerLogBase {}

// 2. Type cho chi tiết Log (Xem chi tiết)
export interface CrawlerLogDetail extends CrawlerLogBase {
  // Tái sử dụng Rule Type đã define bên schema.ts
  rule: Rule; 
}

// Params lọc
export interface GetCrawlerLogsParams {
  status?: CrawlerLogStatus;
  ruleId?: number;
}

export interface WardV2 {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  province_code: number;
}

export interface ProvinceV2 {
  code: number;
  name: string;
  wards: WardV2[];
}