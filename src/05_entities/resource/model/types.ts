import { z } from "zod";
import { 
  resourceItemSchema, 
  resourceStatsSchema, 
  resourceFolderResponseSchema,
  biddingHistoryItemSchema,
  biddingHistoryResponseSchema,
  historyFilterOptionsSchema
} from "./schema";

// ==========================================
// 1. RESOURCE TYPES
// ==========================================

// Type cho Item (File/Folder)
export type ResourceItem = z.infer<typeof resourceItemSchema>;

// Type cho Response Folder
export type ResourceFolderResponse = z.infer<typeof resourceFolderResponseSchema>;

// Type cho Stats (UI)
export type ResourceStats = z.infer<typeof resourceStatsSchema>;

// ==========================================
// 2. BIDDING HISTORY TYPES
// ==========================================

// Type cho 1 dòng dự án (Dùng cho Table)
export type BiddingHistoryItem = z.infer<typeof biddingHistoryItemSchema>;

// Type cho Response API Lịch sử (Dùng cho API return)
export type BiddingHistoryResponse = z.infer<typeof biddingHistoryResponseSchema>;

// Type cho Options Bộ lọc (Dùng cho Sidebar)
export type HistoryFilterOptions = z.infer<typeof historyFilterOptionsSchema>;

// ==========================================
// 3. LEGACY / MANUAL TYPES (Nếu còn dùng)
// ==========================================

// Type riêng cho Response của API Stats gốc (trước khi map sang UI)
// Giữ lại nếu bạn cần hứng raw data từ BE trước khi convert
export interface ApiStatsResponse {
  totalRepoFiles?: number;      // API: total_repo_files -> Interceptor
  currentFolderFiles?: number;  // API: current_folder_files -> Interceptor
  folderId?: string;
}