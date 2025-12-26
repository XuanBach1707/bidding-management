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
  
  // Các trường optional (chỉ có ở cấp file hoặc chi tiết folder)
  mimeType?: string;
  level?: number;
}

export interface DriveResponse {
  // Response có thể trả về currentContext (ở root) hoặc currentFolderId (ở folder con)
  currentContext?: string; 
  currentFolderId?: string;
  
  total?: number;       // Map từ total (root)
  totalItems?: number;  // Map từ total_items (folder)
  
  data: DriveItem[];
}

export interface InitDriveProjectDto {
  projectName: string; // FE dùng camelCase, Interceptor sẽ tự đổi thành snake_case 'project_name' khi gửi
}