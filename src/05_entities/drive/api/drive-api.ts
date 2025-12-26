import axios from "axios"; // Import axios gốc
import { http } from "@/shared/api"; // Vẫn import http cho các hàm khác
import { authStorage } from "@/shared/lib/auth"; // Import để lấy token thủ công
import { DriveResponse, InitDriveProjectDto } from "../model/types";

// Lấy Base URL giống như trong file cấu hình http
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://26.112.109.171:8000/";

export const driveApi = {
  /**
   * 1. Lấy danh sách dự án (Giữ nguyên dùng http instance)
   */
  getRootProjects: (): Promise<DriveResponse> => {
    return http.get("/drive/projects");
  },

  /**
   * 2. Lấy chi tiết thư mục (Giữ nguyên dùng http instance)
   */
  getFolderDetail: (folderId: string): Promise<DriveResponse> => {
    return http.get(`/drive/folder/${folderId}`);
  },

  /**
   * 3. [FIXED] Khởi tạo folder dự án
   * Sử dụng axios gốc để tránh bị config 'application/json' của dự án can thiệp.
   */
  initProject: (payload: InitDriveProjectDto): Promise<any> => {
      const formData = new FormData();
      formData.append('project_name', payload.projectName);

      // Bây giờ interceptor đã thông minh, chỉ cần gọi thế này là xong:
      return http.post("/drive/init-project", formData);
  },
};