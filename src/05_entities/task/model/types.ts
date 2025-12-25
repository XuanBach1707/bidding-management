import { z } from "zod";
import { 
  CreateTaskSchema, 
  TaskAssignmentSchema, 
  TaskStatusEnum,
  AssignmentTypeEnum, 
  UserRoleEnum,
  TaskPriorityEnum,
  TaskTagEnum // [MỚI]
} from "./schemas";

// 1. Export Enum thô
export const AssignmentType = AssignmentTypeEnum.enum; 
export const TaskPriority = TaskPriorityEnum.enum;
export const TaskTag = TaskTagEnum.enum; // [MỚI]

// 2. Types suy luận từ Zod
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusEnum>;
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;
export type TaskTag = z.infer<typeof TaskTagEnum>; // [MỚI] Type: "LEGAL" | "FINANCE" | ...

// 3. Interface cho Task thực thể (sau khi fetch từ API)
export interface TaskAssignment {
  assignmentId: number;
  assignedUnitId: number;
  assignedUserId: number | null;
  assignmentType: z.infer<typeof AssignmentTypeEnum>;
  requiredRole: z.infer<typeof UserRoleEnum>;
  requiredMinSecurity: number;
  isAccepted: boolean;
}

export interface Task extends Omit<CreateTaskDto, 'assignments'> {
  id: number;
  assignments: TaskAssignment[]; 
  subTasks: Task[]; 
  createdAt?: string;
  updatedAt?: string;
  progress?: number; 
  hasFile?: boolean;
}