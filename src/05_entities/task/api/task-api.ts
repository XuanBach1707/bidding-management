import { http } from "@/shared/api";
import { CreateTaskDto, Task } from "../model/types";

export const taskApi = {
  /**
   * 1. Lấy danh sách task theo Project ID (Dành cho màn hình chi tiết dự án)
   * Interceptor tự xử lý: snake_case (BE) -> camelCase (FE)
   */
  getList: (projectId: number | string): Promise<Task[]> => {
    return http.get(`/tasks/project/${projectId}`);
  },

  /**
   * 2. [MỚI] Lấy danh sách task được giao cho chính người dùng hiện tại
   * Dùng cho màn hình /my-tasks
   * Interceptor tự xử lý: snake_case (BE) -> camelCase (FE)
   */
  getMyTasks: (): Promise<Task[]> => {
    return http.get("/tasks/user/me");
  },

  /**
   * 3. Tạo task mới
   * Interceptor tự xử lý: camelCase (FE) -> snake_case (BE)
   */
  create: (data: CreateTaskDto): Promise<Task> => {
    return http.post("/tasks/", data);
  }
};