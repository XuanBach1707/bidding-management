import { z } from "zod";
import { 
  resourceItemSchema, 
  resourceStatsSchema, 
  resourceFolderResponseSchema,
  biddingHistoryItemSchema,
  biddingHistoryResponseSchema,
  historyFilterOptionsSchema,
  resourceBreakdownItemSchema
} from "./schema"; // Chú ý đường dẫn import schema cho đúng cấu trúc folder của bạn

// ==========================================
// 1. RESOURCE TYPES
// ==========================================

// ResourceItem bây giờ sẽ tự động có thêm: parentName?: string | null | undefined
export type ResourceItem = z.infer<typeof resourceItemSchema>;

export type ResourceFolderResponse = z.infer<typeof resourceFolderResponseSchema>;

export type ResourceStats = z.infer<typeof resourceStatsSchema>;

// [MỚI] Type cho item biểu đồ
export type ResourceBreakdownItem = z.infer<typeof resourceBreakdownItemSchema>;

// ==========================================
// 2. BIDDING HISTORY TYPES
// ==========================================

export type BiddingHistoryItem = z.infer<typeof biddingHistoryItemSchema>;

export type BiddingHistoryResponse = z.infer<typeof biddingHistoryResponseSchema>;

export type HistoryFilterOptions = z.infer<typeof historyFilterOptionsSchema>;

// ==========================================
// 3. LEGACY / MANUAL TYPES
// ==========================================

export interface ApiStatsResponse {
  totalRepoFiles?: number;      
  currentFolderFiles?: number;  
  folderId?: string;
  breakdown?: ResourceBreakdownItem[]; // [MỚI] Cập nhật interface raw response
}