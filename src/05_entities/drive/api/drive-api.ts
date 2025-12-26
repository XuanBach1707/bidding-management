import { http } from "@/shared/api"; 
import { DriveResponse, InitDriveProjectDto } from "../model/types"; // Đảm bảo đường dẫn import đúng

export const driveApi = {
  /**
   * 1. Lấy danh sách dự án
   */
  getRootProjects: (): Promise<DriveResponse> => {
    return http.get("/drive/projects");
  },

  /**
   * 2. Lấy chi tiết thư mục
   */
  getFolderDetail: (folderId: string): Promise<DriveResponse> => {
    return http.get(`/drive/folder/${folderId}`);
  },

  /**
   * 3. [FIXED] Khởi tạo folder dự án theo Project ID
   * Payload nhận vào là projectId (number), gửi lên server key 'project_id'
   */
  initProject: (payload: InitDriveProjectDto): Promise<any> => {
      const formData = new FormData();
      // LOGIC MỚI: Truyền project_id thay vì project_name
      // Cần ép sang String vì FormData chỉ nhận chuỗi hoặc Blob
      formData.append('project_id', String(payload.projectId));

      // Gọi qua http instance (Interceptor sẽ tự xử lý headers nếu cần)
      return http.post("/drive/init-project", formData);
  },
};