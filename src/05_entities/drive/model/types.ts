import { z } from "zod";
import { cloneFileSchema, driveSearchResponseSchema } from "./schemas";

export enum DriveItemType {
  FOLDER = "FOLDER",
  FILE = "FILE",
}

export interface DriveItem {
  id: string;
  name: string;
  type: DriveItemType | string; 
  link: string;
  access: string; 
  
  // Các trường optional
  mimeType?: string;
  level?: number;
  
  // [MỚI] Thêm dòng này để khớp với schema và sửa lỗi ở UI
  webViewLink?: string;

  // Tag & Project Info
  tag?: string | null;            
  grantedByProject?: string | null;

  // [MỚI] Mảng ID cha (Dùng khi search để biết file nằm ở đâu)
  parentId?: string | null;   // API: parent_id
  parentName?: string | null; // API: parent_name
  parents?: string[];         // API: parents (mảng ID)
}

export interface DriveResponse {
  currentContext?: string; 
  currentFolderId?: string;
  
  // Thông tin dự án
  projectId?: number;
  projectName?: string;
  
  // Số lượng
  total?: number;
  totalItems?: number;
  
  data: DriveItem[];
}

// [MỚI] Type cho Response Search
export type DriveSearchResponse = z.infer<typeof driveSearchResponseSchema>;

export interface InitDriveProjectDto {
  projectId: number; 
}

// DTO cho Clone File
export type CloneFileDto = z.infer<typeof cloneFileSchema>;