import { z } from "zod";

// 1. Schema cho từng Item (File/Folder)
export const driveItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["FOLDER", "FILE"]).or(z.string()),
  link: z.string().url(),
  access: z.string(),
  mimeType: z.string().optional(),
  level: z.number().optional(),
  
  // Các trường bổ sung
  tag: z.string().optional().nullable(), 
  grantedByProject: z.string().optional().nullable(),
  
// [MỚI] Thêm field này để hứng dữ liệu
  parentId: z.string().optional().nullable(),
  parentName: z.string().optional().nullable(),
  parents: z.array(z.string()).optional(),
});

// 2. Schema cho Response duyệt thư mục thường (Root/Folder Detail)
export const driveResponseSchema = z.object({
  currentContext: z.string().optional(),
  currentFolderId: z.string().optional(),
  projectId: z.number().optional(),
  projectName: z.string().optional(),
  total: z.number().optional(),
  totalItems: z.number().optional(),
  data: z.array(driveItemSchema),
});

// 3. Schema cho hành động Clone File
export const cloneFileSchema = z.object({
  sourceFileId: z.string(),
  targetFolderId: z.string(),
});

// [MỚI] 4. Schema cho Response Tìm kiếm (Search Repo)
export const driveSearchResponseSchema = z.object({
  query: z.string(),
  scope: z.string().optional(), // Folder ID giới hạn tìm kiếm
  totalMatches: z.number().optional(),   // Map từ total_matches
  treeRootsCount: z.number().optional(), // Map từ tree_roots_count
  data: z.array(driveItemSchema),        // Tái sử dụng Item Schema
});

// Export Type inference từ Zod (Optional, dùng tiện lợi trong file types)
export type DriveItemSchema = z.infer<typeof driveItemSchema>;