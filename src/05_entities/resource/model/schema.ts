import { z } from "zod";

// ==========================================
// 1. RESOURCE DRIVE (File/Folder)
// ==========================================
export const resourceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(), // "FOLDER" | "FILE"
  link: z.string().url().optional().nullable(),
  access: z.string().optional(),
  mimeType: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export const resourceFolderResponseSchema = z.object({
  currentFolderId: z.string().optional(), // Interceptor đã convert snake_case -> camelCase
  totalItems: z.number().optional(),
  data: z.array(resourceItemSchema),
});

export const resourceStatsSchema = z.object({
  totalFiles: z.number().default(0),
  totalSizeLabel: z.string().optional(),
  filesChangePercentage: z.number().optional(),
});

// ==========================================
// 2. BIDDING HISTORY (Lịch sử dự án)
// ==========================================

// Schema cho từng dự án trong danh sách
export const biddingHistoryItemSchema = z.object({
  hsmtId: z.number(),
  maTbmt: z.string(),
  tenDuAn: z.string(),
  chuDauTu: z.string(),
  linhVuc: z.string().optional().nullable(),
  nam: z.number(),
  
  // [QUAN TRỌNG] Field mới mapping từ folder_id
  // Để optional/nullable đề phòng dữ liệu cũ chưa có liên kết
  folderId: z.string().optional().nullable(), 
});

// Schema cho Response trả về danh sách dự án (có phân trang)
export const biddingHistoryResponseSchema = z.object({
  items: z.array(biddingHistoryItemSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  pages: z.number(),
});

// ==========================================
// 3. FILTERS (Bộ lọc)
// ==========================================

// Schema cho API /bidding-packages/history/filters
export const historyFilterOptionsSchema = z.object({
  years: z.array(z.number()),
  investors: z.array(z.string()),
});