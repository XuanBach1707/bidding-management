import { http } from "./instance";

// Định nghĩa item trên Drive (File/Folder)
export interface DriveItem {
  id: string;
  name: string;
  type: "FILE" | "FOLDER";
  mime_type?: string;
  link: string; // Link xem trước (WebViewLink)
  level?: number;
  tag?: string | null; // Tag nghiệp vụ (HR, LEGAL...)
  access?: "GRANTED" | "DENIED"; // Quyền truy cập trả về từ BE
}

export const driveApi = {
  // 1. API lấy nội dung folder thường (Dùng khi navigate sâu vào folder con)
  getFolderContent: (folderId: string): Promise<{ data: DriveItem[], current_folder_id: string }> => {
    return http.get(`/drive/folder/${folderId}`);
  },

  // 2. [QUAN TRỌNG] API lấy folder theo ngữ cảnh User + Project
  // Gọi: /drive/folder/{rootId}/me?project_id=19
  // Backend sẽ tự lọc folder theo quyền hạn/tag của user trong dự án đó
  getMyContextFolder: (rootFolderId: string, projectId: number | string): Promise<{ data: DriveItem[], current_folder_id: string }> => {
    return http.get(`/drive/folder/${rootFolderId}/me`, {
      params: { 
        project_id: projectId 
      }
    });
  },

  // 3. API Tìm kiếm
  searchFiles: (query: string): Promise<{ data: DriveItem[] }> => {
    return http.get(`/drive/search-repo`, { params: { query } });
  }
};