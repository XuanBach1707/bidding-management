import { z } from "zod";
import { 
  resourceItemSchema, 
  resourceStatsSchema, 
  yearFolderSchema,
  resourceFolderResponseSchema 
} from "./schema";

// Type cho Item (File/Folder)
export type ResourceItem = z.infer<typeof resourceItemSchema>;

// Type cho Response Folder (Đã qua CamelCase của Interceptor)
// Lưu ý: Interceptor biến snake_case thành camelCase
export interface ResourceFolderResponse {
  currentFolderId?: string; // API: current_folder_id -> Interceptor: currentFolderId
  totalItems?: number;      // API: total_items
  data: ResourceItem[];
}

// Type riêng cho Response của API Stats (khi API trả về)
export interface ApiStatsResponse {
  totalRepoFiles?: number;      // API: total_repo_files -> Interceptor: totalRepoFiles
  currentFolderFiles?: number;  // API: current_folder_files -> Interceptor: currentFolderFiles
  folderId?: string;
}

// Type cho Stats (Sau khi FE chế biến để dùng ở UI)
export type ResourceStats = z.infer<typeof resourceStatsSchema>;

// Type cho Năm
export type YearFolder = z.infer<typeof yearFolderSchema>;