import { http } from "@/shared/api"; 
import { 
  DriveResponse, 
  InitDriveProjectDto, 
  CloneFileDto,
  DriveSearchResponse 
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
   * 3. [MỚI] Tìm kiếm trong kho (Search Repo)
   * GET /drive/search-repo
   * Params: query (required), folder_id (optional)
   */
  searchRepo: (keyword: string, folderId?: string | null): Promise<DriveSearchResponse> => {
    return http.get("/drive/search-repo", {
      params: {
        // Lưu ý: Key là 'query' hay 'quere' tùy thuộc vào Backend của bạn.
        // Theo JSON mẫu bạn gửi thì response trả về 'query', nên tôi dùng 'query'.
        query: keyword, 
        folder_id: folderId || undefined, 
      }
    });
  },

  /**
   * 4. Khởi tạo folder dự án (Cũ)
   */
  initProject: (payload: InitDriveProjectDto): Promise<any> => {
      const formData = new FormData();
      formData.append('project_id', String(payload.projectId));
      return http.post("/drive/init-project", formData);
  },

  // --- [CÁC API CHO WORKSPACE / SELECTION] ---

  /**
   * 5. [SELECTION STEP 1] Lấy danh sách folder nguồn
   */
  getProjectFolders: (projectId: number | string): Promise<DriveResponse & { currentFolderId: string }> => {
    return http.get(`/bidding-projects/folder/${projectId}/me`);
  },

  /**
   * 6. [SELECTION STEP 3] Lấy Target Folder ID
   */
  getTargetFolder: (projectFolderId: string, projectId: number | string): Promise<{ targetFolderId: string }> => {
    return http.get(`/drive/project/${projectFolderId}/me/target-folder`, {
      params: { 
        project_id: projectId 
      }
    });
  },

  /**
   * 7. [SELECTION STEP 4] Clone File
   */
  cloneFile: (payload: CloneFileDto): Promise<any> => {
    const formData = new FormData();
    formData.append('source_file_id', payload.sourceFileId);
    formData.append('target_folder_id', payload.targetFolderId);
    
    return http.post("/drive/clone-file", formData);
  }
};