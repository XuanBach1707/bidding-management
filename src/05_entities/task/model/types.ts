import { z } from "zod";
import { 
  CreateTaskSchema, 
  TaskAssignmentSchema, // Import Schema vừa sửa
  TaskStatusEnum,
  AssignmentTypeEnum, 
  UserRoleEnum,
  TaskPriorityEnum,
  TaskTagEnum,
  TaskTypeEnum 
} from "./schemas";

// 1. Export Enum Value (Để dùng trong code logic)
export const AssignmentType = AssignmentTypeEnum.enum; 
export const TaskPriority = TaskPriorityEnum.enum;
export const TaskTag = TaskTagEnum.enum;
export const TaskType = TaskTypeEnum.enum; 

// 2. Types inferred (Tự động cập nhật theo schema)
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusEnum>;
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;
export type TaskTag = z.infer<typeof TaskTagEnum>;
export type TaskType = z.infer<typeof TaskTypeEnum>;

// 3. Entity Interfaces

// [TỐI ƯU] Lấy type trực tiếp từ Schema để đảm bảo có field user và unit
export type TaskAssignment = z.infer<typeof TaskAssignmentSchema>;

export interface Task extends Omit<CreateTaskDto, 'assignments'> {
  id: number;
  assignments: TaskAssignment[]; // Tự động nhận type có user, unit
  subTasks: Task[]; 
  createdAt?: string;
  updatedAt?: string;
  progress?: number; 
  hasFile?: boolean;
  projectName?: string; 
  // attachmentUrl đã có trong CreateTaskDto
}