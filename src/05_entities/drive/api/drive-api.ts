import { http } from "@/shared/api"; 
import { 
  DriveResponse, 
  DriveSearchResponse,
} from "../model/types"; 

export const driveApi = {
  /**
   * 1. Lấy danh sách dự án (Root)
   * GET /drive/projects
   */
  getRootProjects: (): Promise<DriveResponse> => {
    return http.get("/drive/projects");
  },

  /**
   * 2. Lấy chi tiết thư mục
   * GET /drive/folder/{folderId}
   */
  getFolderDetail: (folderId: string): Promise<DriveResponse> => {
    return http.get(`/drive/folder/${folderId}`);
  },

  /**
   * 3. Tìm kiếm trong kho (Search Repo)
   * GET /drive/search-repo
   */
  searchRepo: (keyword: string, folderId?: string | null): Promise<DriveSearchResponse> => {
    return http.get("/drive/search-repo", {
      params: {
        query: keyword, 
        folder_id: folderId || undefined, 
      }
    });
  },

  /**
   * 4. Khởi tạo folder dự án
   * POST /drive/init-project
   * [Note] Gửi JSON body { projectId: number }
   */
  initProject: (payload: { projectId: number }): Promise<any> => {
      return http.post("/drive/init-project", payload);
  },

  /**
   * 5. [QUAN TRỌNG] Clone file
   * POST /drive/clone-file
   * * [FIX LỖI 400]: 
   * - Không dùng FormData.
   * - Gửi Object thuần -> Axios tự set Content-Type: application/json.
   * - Interceptor sẽ tự đổi sourceFileId -> source_file_id.
   */
  cloneFile: (payload: { sourceFileId: string; targetFolderId: string }): Promise<any> => {
    return http.post("/drive/clone-file", payload);
  },

  // --- CÁC API CŨ/KHÁC (Giữ lại để tương thích ngược nếu cần) ---

  // Hàm này có thể thừa nếu đã dùng cloneFile ở trên, nhưng giữ lại nếu logic cũ còn dùng
  copyFile: (data: { fileId: string; targetFolderId: string; newName?: string }): Promise<any> => {
    return http.post("/drive/clone-file", {
        sourceFileId: data.fileId,
        targetFolderId: data.targetFolderId
        // newName logic chưa thấy ở hook, nhưng nếu cần thì thêm vào đây
    });
  },

  getProjectFolders: (projectId: number | string): Promise<DriveResponse & { currentFolderId: string }> => {
    return http.get(`/bidding-projects/folder/${projectId}/me`);
  },

  getTargetFolder: (projectFolderId: string, projectId: number | string): Promise<{ targetFolderId: string }> => {
    return http.get(`/drive/project/${projectFolderId}/me/target-folder`, {
      params: { 
        project_id: projectId 
      }
    });
  }
};