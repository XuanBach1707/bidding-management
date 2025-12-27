export enum DriveItemType {
  FOLDER = "FOLDER",
  FILE = "FILE",
}

export interface DriveItem {
  id: string;
  name: string;
  type: DriveItemType | string; // Enum: FOLDER | FILE
  link: string;
  access: string; // VD: "GRANTED"
  
  // Các trường optional
  mimeType?: string;
  level?: number;
}

export interface DriveResponse {
  currentContext?: string; 
  currentFolderId?: string;
  
  total?: number;
  totalItems?: number;
  
  data: DriveItem[];
}

// --- [SỬA ĐỔI TẠI ĐÂY] ---
export interface InitDriveProjectDto {
  projectId: number; 
  // FE dùng 'projectId', Interceptor sẽ tự đổi thành 'project_id' khi gửi request
}