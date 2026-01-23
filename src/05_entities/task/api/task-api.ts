import { http } from "@/shared/api"; 
import { CreateTaskDto, Task } from "../model/types";

export type UpdateTaskDto = Partial<CreateTaskDto>;

export const taskApi = {
  // =========================================================
  // KHU VỰC 1: API CHO NHÂN VIÊN / CHUNG
  // =========================================================

  // Lấy danh sách task theo Project
  getList: (projectId: number | string): Promise<Task[]> => {
    return http.get(`/tasks/project/${projectId}`);
  },

  // Lấy task của tôi
  getMyTasks: (): Promise<Task[]> => {
    return http.get("/tasks/user/me/");
  },

  // Lấy danh sách task được giao (Sidebar nhân viên)
  getAssignedTasks: (): Promise<Task[]> => {
    return http.get("/tasks/user/assigned");
  },

  // Lấy chi tiết Task (Góc nhìn nhân viên/chung)
  getDetail: (id: number): Promise<Task> => {
    return http.get(`/tasks/${id}`);
  },

  // Tạo task
  create: (data: CreateTaskDto): Promise<Task> => {
    return http.post("/tasks/", data);
  },

  // Update thông tin chung
  update: (id: number, data: UpdateTaskDto): Promise<Task> => {
    return http.put(`/tasks/${id}`, data);
  },

  // [MỚI] Upload file đính kèm
  // Endpoint: POST /tasks/{task_id}/attachments
  // Body: FormData (files: File[])
  uploadAttachment: (id: number, files: FileList | File[]): Promise<Task> => {
    const formData = new FormData();
    
    // Convert FileList sang mảng nếu cần
    const fileArray = Array.from(files);

    // Backend yêu cầu field là 'files'
    fileArray.forEach((file) => {
      formData.append('files', file);
    });

    // Header Content-Type sẽ được Interceptor tự động xử lý (xóa đi để browser tự set boundary)
    return http.post(`/tasks/${id}/attachments`, formData);
  },

  // Submit (Gửi duyệt)
  submit: (id: number): Promise<Task> => {
    return http.post(`/tasks/${id}/submit`);
  },

  // Xóa task
  delete: (id: number): Promise<any> => {
    return http.delete(`/tasks/${id}`);
  },

  // =========================================================
  // KHU VỰC 2: API CHO REVIEWER (QUẢN LÝ/NGƯỜI DUYỆT)
  // =========================================================

  /**
   * 1. Lấy danh sách task cần tôi duyệt
   * GET /users/reviewer-list
   */
  getReviewerList: (): Promise<Task[]> => {
    return http.get("/users/reviewer-list");
  },

  /**
   * 2. Xem chi tiết task dưới góc độ Reviewer
   * GET /users/reviewer/{task_id}
   * (Lưu ý: Khác với getDetail ở trên)
   */
  getReviewerDetail: (id: number): Promise<Task> => {
    return http.get(`/users/reviewer/${id}`);
  },

  /**
   * 3. Cập nhật trạng thái duyệt (Duyệt hoặc Từ chối)
   * PATCH /tasks/{task_id}/status
   * Params: status (COMPLETED | REJECTED)
   */
  updateReviewStatus: (id: number, status: "COMPLETED" | "REJECTED"): Promise<Task> => {
    // Lưu ý: Interceptor sẽ lo phần camelCase, ta chỉ cần truyền đúng params
    return http.patch(`/tasks/${id}/status`, null, { 
      params: { status } 
    });
  },
};