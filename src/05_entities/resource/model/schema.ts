import { z } from "zod";

// 1. Schema cho File/Folder trong kho (Độc lập với Drive Entity)
export const resourceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Type trả về từ API thường là "FOLDER" hoặc "FILE"
  type: z.string(), 
  link: z.string().url().optional(), // Có thể null hoặc undefined
  access: z.string().optional(),
  
  // Các trường bổ sung nếu cần hiển thị icon/mimetype
  mimeType: z.string().optional().nullable(),
  
  // Parent info (để làm breadcrumb sau này nếu API trả về)
  parentId: z.string().optional().nullable(),
});

// 2. Schema cho Response từ API getFolderDetail
export const resourceFolderResponseSchema = z.object({
  current_folder_id: z.string().optional(),
  total_items: z.number().optional(),
  data: z.array(resourceItemSchema),
});

// 3. Schema cho Thống kê (Dashboard Stats)
// Vì API trả về ít, ta define schema khớp với thực tế + trường optional để mock
export const resourceStatsSchema = z.object({
  // Mapping từ total_repo_files
  totalFiles: z.number().default(0), 
  
  // Các field UI cần nhưng API chưa có (để Optional)
  totalSizeLabel: z.string().optional(), // VD: "45.2 GB"
  filesChangePercentage: z.number().optional(), // VD: 12 (%)
});

// 4. Schema cho Năm (Dùng cho Dropdown lịch sử)
export const yearFolderSchema = z.object({
  id: z.string(),
  year: z.number(), // Đã ép kiểu từ string name sang number
});

export const projectFilterSchema = z.object({
  years: z.array(z.number()),
  investors: z.array(z.string()),
  sectors: z.array(z.string()), // Lĩnh vực: Xây lắp, Tư vấn, Thiết kế...
});