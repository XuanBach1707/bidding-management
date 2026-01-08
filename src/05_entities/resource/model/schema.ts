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
  // [MỚI] Thêm trường tên thư mục cha
  parentName: z.string().optional().nullable(), 

  // [MỚI] Bổ sung các trường từ API trả về
  updatedAt: z.string().optional(), // Map từ updated_at
  tag: z.string().optional().nullable(), // Map từ tag
  level: z.number().optional(), // Map từ level
});

export const resourceFolderResponseSchema = z.object({
  currentFolderId: z.string().optional(),
  totalItems: z.number().optional(),
  data: z.array(resourceItemSchema),
});

// [MỚI] Schema cho item trong biểu đồ
export const resourceBreakdownItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number(),
});

export const resourceStatsSchema = z.object({
  totalFiles: z.number().default(0),
  totalSizeLabel: z.string().optional(),
  filesChangePercentage: z.number().optional(),
  
  // [MỚI] Thêm trường này để hứng dữ liệu cho biểu đồ
  breakdown: z.array(resourceBreakdownItemSchema).optional().default([]),
});

// ==========================================
// 2. BIDDING HISTORY (Lịch sử dự án)
// ==========================================

export const biddingHistoryItemSchema = z.object({
  hsmtId: z.number(),
  maTbmt: z.string(),
  tenDuAn: z.string(),
  chuDauTu: z.string(),
  linhVuc: z.string().optional().nullable(),
  nam: z.number(),
  folderId: z.string().optional().nullable(), 
});

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

export const historyFilterOptionsSchema = z.object({
  years: z.array(z.number()),
  investors: z.array(z.string()),
});