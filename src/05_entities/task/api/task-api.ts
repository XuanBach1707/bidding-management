import { http } from "@/shared/api";
import { CreateTaskDto, Task } from "../model/types";

// [MỚI] Định nghĩa type cho Update
// Dùng Partial vì khi update ta không bắt buộc gửi lại toàn bộ (ví dụ projectId)
export type UpdateTaskDto = Partial<CreateTaskDto>;

export const taskApi = {
  /**
   * 1. Lấy danh sách task theo Project ID
   */
  getList: (projectId: number | string): Promise<Task[]> => {
    return http.get(`/tasks/project/${projectId}`);
  },

  /**
   * 2. Lấy danh sách task của tôi
   */
  getMyTasks: (): Promise<Task[]> => {
    return http.get("/tasks/user/me");
  },

  /**
   * 3. Tạo task mới
   */
  create: (data: CreateTaskDto): Promise<Task> => {
    return http.post("/tasks/", data);
  },

  /**
   * 4. [MỚI] Cập nhật Task
   * PUT /tasks/{id}
   * Payload: UpdateTaskDto (Gửi assignments để thay thế người làm)
   */
  update: (id: number, data: UpdateTaskDto): Promise<Task> => {
    return http.put(`/tasks/${id}`, data);
  },

  /**
   * 5. [MỚI] Xóa Task (Nếu cần)
   * DELETE /tasks/{id}
   */
  delete: (id: number): Promise<any> => {
    return http.delete(`/tasks/${id}`);
  }
};