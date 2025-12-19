import { z } from "zod";
import { 
  CreateTaskSchema, 
  TaskAssignmentSchema, 
  TaskStatusEnum 
} from "./schemas";

// Types suy luận từ Zod Schema
export type TaskAssignment = z.infer<typeof TaskAssignmentSchema>;
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

// [MỚI] Định nghĩa Task trả về từ Backend (bao gồm ID)
export interface Task extends CreateTaskDto {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}