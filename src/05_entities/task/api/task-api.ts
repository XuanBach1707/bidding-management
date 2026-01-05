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

  /**
   * [QUAN TRỌNG] Lấy danh sách task được giao ĐÍCH DANH (Màn hình My Workspace)
   * GET /tasks/user/assigned
   */
  getAssignedTasks: (): Promise<Task[]> => {
    return http.get("/tasks/user/assigned");
  },

  // 3. Tạo task
  create: (data: CreateTaskDto): Promise<Task> => {
    return http.post("/tasks/", data);
  },

  // 4. Update thông tin
  update: (id: number, data: UpdateTaskDto): Promise<Task> => {
    return http.put(`/tasks/${id}`, data);
  },

  /**
   * [MỚI] Cập nhật trạng thái Task
   * PATCH /tasks/{id}/status
   */
  updateStatus: (id: number, status: string): Promise<any> => {
    return http.patch(`/tasks/${id}/status`, null, { 
      params: { status } 
    });
  },

  // 5. Xóa
  delete: (id: number): Promise<any> => {
    return http.delete(`/tasks/${id}`);
  },

  // [BỔ SUNG] Hàm lấy chi tiết Task (Sửa lỗi property 'getDetail' does not exist)
  getDetail: (id: number): Promise<Task> => {
    return http.get(`/tasks/${id}`);
  }
};