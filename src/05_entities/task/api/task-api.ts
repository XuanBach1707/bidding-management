import { http } from "@/06_shared/api/instance"; // Kiểm tra lại đường dẫn import instance của bạn
import { CreateTaskDto, Task } from "../model/types";

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
   * 3. [MỚI] Lấy chi tiết task theo ID
   * Endpoint: /tasks/{id}
   */
  getDetail: (taskId: number | string): Promise<any> => {
    return http.get(`/tasks/${taskId}`);
  },

  /**
   * 4. Tạo task mới
   */
  create: (data: CreateTaskDto): Promise<Task> => {
    return http.post("/tasks/", data);
  }
};