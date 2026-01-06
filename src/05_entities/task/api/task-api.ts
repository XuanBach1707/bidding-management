import { http } from "@/shared/api"; 
import { CreateTaskDto, Task } from "../model/types";

export type UpdateTaskDto = Partial<CreateTaskDto>;

export const taskApi = {
  // 1. Lấy danh sách task theo Project
  getList: (projectId: number | string): Promise<Task[]> => {
    return http.get(`/tasks/project/${projectId}`);
  },

  // 2. Lấy task của tôi
  getMyTasks: (): Promise<Task[]> => {
    return http.get("/tasks/user/me");
  },

  // Lấy danh sách task được giao (Sidebar)
  getAssignedTasks: (): Promise<Task[]> => {
    return http.get("/tasks/user/assigned");
  },

  // Lấy chi tiết Task
  getDetail: (id: number): Promise<Task> => {
    return http.get(`/tasks/${id}`);
  },

  // 3. Tạo task
  create: (data: CreateTaskDto): Promise<Task> => {
    return http.post("/tasks/", data);
  },

  // 4. Update thông tin chung
  update: (id: number, data: UpdateTaskDto): Promise<Task> => {
    return http.put(`/tasks/${id}`, data);
  },

  // 5. Cập nhật trạng thái thủ công (Dành cho các case khác nếu cần)
  updateStatus: (id: number, status: string): Promise<any> => {
    return http.patch(`/tasks/${id}/status`, null, { 
      params: { status } 
    });
  },

  /**
   * [MỚI - QUAN TRỌNG] 
   * Submit task để chuyển trạng thái từ IN_PROGRESS -> PENDING_REVIEW
   * POST /tasks/{id}/submit
   */
  submit: (id: number): Promise<Task> => {
    return http.post(`/tasks/${id}/submit`);
  },

  // 6. Xóa task
  delete: (id: number): Promise<any> => {
    return http.delete(`/tasks/${id}`);
  }
};