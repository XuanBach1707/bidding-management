import { z } from "zod";
import { cloneFileSchema } from "./schemas";

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
  
  // [MỚI]
  tag?: string;             // Ví dụ: "HR", "LEGAL"
  grantedByProject?: string; // Tên dự án cấp quyền
}

export interface DriveResponse {
  currentContext?: string; 
  currentFolderId?: string;
  
  // [MỚI] Bổ sung cho khớp response API step 1
  projectId?: number;
  projectName?: string;
  
  total?: number;
  totalItems?: number;
  
  data: DriveItem[];
}

export interface InitDriveProjectDto {
  projectId: number; 
}

// [MỚI] DTO cho Clone File
export type CloneFileDto = z.infer<typeof cloneFileSchema>;