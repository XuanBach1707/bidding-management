import { http } from "@/shared/api"; // Import từ index của shared/api (nơi export interceptor)
import { DriveResponse } from "../model/types";

export const driveApi = {
  /**
   * 1. Lấy danh sách dự án ở thư mục gốc (Root)
   * GET /drive/projects
   */
  getRootProjects: (): Promise<DriveResponse> => {
    return http.get("/drive/projects");
  },

  /**
   * 2. Lấy chi tiết nội dung trong một thư mục
   * GET /drive/folder/{folderId}
   */
  getFolderDetail: (folderId: string): Promise<DriveResponse> => {
    return http.get(`/drive/folder/${folderId}`);
  }
};