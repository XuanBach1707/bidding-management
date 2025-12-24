import { z } from "zod";
import { 
  CreateTaskSchema, 
  TaskAssignmentSchema, 
  TaskStatusEnum,
  AssignmentTypeEnum, 
  UserRoleEnum,
  TaskPriorityEnum // [MỚI] Import enum priority
} from "./schemas";

// 1. Export Enum thô để dùng trong logic (Dropdown, so sánh, badge color)
export const AssignmentType = AssignmentTypeEnum.enum; 
export const TaskPriority = TaskPriorityEnum.enum; // [MỚI]

// 2. Types suy luận từ Zod
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusEnum>;
export type TaskPriority = z.infer<typeof TaskPriorityEnum>; // [MỚI] Type: "LOW" | "MEDIUM" | "HIGH"

// 3. Interface cho Task đã qua Interceptor (camelCase)
export interface TaskAssignment {
  assignmentId: number;
  assignedUnitId: number;
  assignedUserId: number | null;
  assignmentType: z.infer<typeof AssignmentTypeEnum>;
  requiredRole: z.infer<typeof UserRoleEnum>;
  requiredMinSecurity: number;
  isAccepted: boolean;
}

// Interface Task kế thừa từ CreateTaskDto nên đã tự động có field 'priority' thay cho 'isMilestone'
export interface Task extends Omit<CreateTaskDto, 'assignments'> {
  id: number;
  assignments: TaskAssignment[]; 
  subTasks: Task[]; 
  createdAt?: string;
  updatedAt?: string;
  
  // [Optional] Nếu cần map thêm trường file/progress từ UI mẫu vào đây
  // (hiện tại để optional để không gãy code cũ, sau này BE trả về thì bỏ dấu ?)
  progress?: number; 
  hasFile?: boolean;
}