import { http } from "@/shared/api"; 
import { DriveResponse, InitDriveProjectDto, CloneFileDto } from "../model/types"; 

export const driveApi = {
  /**
   * 1. Lấy danh sách dự án (Cũ)
   */
  getRootProjects: (): Promise<DriveResponse> => {
    return http.get("/drive/projects");
  },

  /**
   * 2. Lấy chi tiết thư mục (Dùng chung cho cả Step 2 Selection và Tab C)
   * GET /drive/folder/{folderId}
   */
  getFolderDetail: (folderId: string): Promise<DriveResponse> => {
    return http.get(`/drive/folder/${folderId}`);
  },

  /**
   * 3. Khởi tạo folder dự án (Cũ)
   */
  initProject: (payload: InitDriveProjectDto): Promise<any> => {
      const formData = new FormData();
      formData.append('project_id', String(payload.projectId));
      return http.post("/drive/init-project", formData);
  },

  // --- [CÁC API MỚI CHO WORKSPACE] ---

  /**
   * 4. [SELECTION STEP 1] Lấy danh sách folder nguồn (Kho tài liệu)
   * GET /bidding-projects/folder/{projectId}/me
   * Return: DriveResponse + currentFolderId (camelCase)
   */
  getProjectFolders: (projectId: number | string): Promise<DriveResponse & { currentFolderId: string }> => {
    return http.get(`/bidding-projects/folder/${projectId}/me`);
  },

  /**
   * 5. [SELECTION STEP 3] Lấy Target Folder ID để paste file vào
   * GET /drive/project/{projectFolderId}/me/target-folder
   * Return: targetFolderId (camelCase)
   */
  getTargetFolder: (projectFolderId: string, projectId: number | string): Promise<{ targetFolderId: string }> => {
    return http.get(`/drive/project/${projectFolderId}/me/target-folder`, {
      params: { 
        project_id: projectId // Giữ nguyên snake_case cho params là ĐÚNG
      }
    });
  },

  /**
   * 6. [SELECTION STEP 4] Clone File
   * POST /drive/clone-file
   * Body: FormData (source_file_id, target_folder_id)
   */
  cloneFile: (payload: CloneFileDto): Promise<any> => {
    const formData = new FormData();
    // FormData key giữ snake_case để Backend đọc được
    formData.append('source_file_id', payload.sourceFileId);
    formData.append('target_folder_id', payload.targetFolderId);
    
    return http.post("/drive/clone-file", formData);
  }
};