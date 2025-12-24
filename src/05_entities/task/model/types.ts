import { z } from "zod";
import { 
  CreateTaskSchema, 
  TaskAssignmentSchema, 
  TaskStatusEnum,
  AssignmentTypeEnum, // Import cái này từ schemas
  UserRoleEnum
} from "./schemas";

// 1. Export Enum thô để dùng trong logic so sánh (Đây là chỗ bị thiếu)
export const AssignmentType = AssignmentTypeEnum.enum; 
// Hoặc đơn giản là: export { AssignmentTypeEnum };

// 2. Types suy luận từ Zod
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

// 3. Interface cho Task đã qua Interceptor (camelCase)
export interface TaskAssignment {
  assignmentId: number;
  assignedUnitId: number;
  assignedUserId: number | null;
  assignmentType: z.infer<typeof AssignmentTypeEnum>; // Nó sẽ là "MAIN" | "SUPPORT" | "REVIEW"
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
}