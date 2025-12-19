import { http } from "@/shared/api";
import { CreateTaskDto, Task } from "../model/types";

export const taskApi = {
  create: (data: CreateTaskDto): Promise<Task> => {
    // Ép kiểu 'as Promise<Task>' để TS biết interceptor đã trả về data thật
    return http.post("/tasks/", data) as Promise<Task>;
  }
};