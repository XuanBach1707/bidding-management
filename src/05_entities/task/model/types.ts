import { z } from "zod";
import { 
  CreateTaskSchema, 
  TaskAssignmentSchema, 
  TaskStatusEnum,
  AssignmentTypeEnum, 
  UserRoleEnum,
  TaskPriorityEnum,
  TaskTagEnum,
  TaskTypeEnum // [MỚI]
} from "./schemas";

// 1. Export Enum thô (Dùng cho UI logic - ví dụ so sánh TaskType.SELECTION)
export const AssignmentType = AssignmentTypeEnum.enum; 
export const TaskPriority = TaskPriorityEnum.enum;
export const TaskTag = TaskTagEnum.enum;
export const TaskType = TaskTypeEnum.enum; // [MỚI]

// 2. Types suy luận từ Zod
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusEnum>;
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;
export type TaskTag = z.infer<typeof TaskTagEnum>;
export type TaskType = z.infer<typeof TaskTypeEnum>; // [MỚI]

// 3. Interface cho Task thực thể (sau khi fetch từ API)
export interface TaskAssignment {
  assignmentId: number;
  assignedUnitId: number;
  assignedUserId: number | null;
  assignmentType: z.infer<typeof AssignmentTypeEnum>;
  requiredRole: z.infer<typeof UserRoleEnum>;
  requiredMinSecurity: number;
  isAccepted: boolean;
  
  // [MỚI] Bổ sung thông tin User & Unit để hiển thị trên UI
  // Dữ liệu này được trả về từ API (ví dụ: /tasks/user/me hoặc getList)
  user?: {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  } | null;

  unit?: {
    unitName?: string;
  } | null;
}

// --- 3. Cập nhật Task Interface chính ---
export interface Task {
  id: number;
  task_name: string;
  deadline: string | null;
  status: string; // OPEN, IN_PROGRESS, ...
  priority: string | null;
  task_type: string;
  description: string | null;
  project_name: string | null;
  
  // Thông tin liên kết
  bidding_project_id: number | null;
  parent_task_id: number | null;
  
  // Danh sách phân công (để lấy tên người làm)
  assignments: TaskAssignment[]; 
  subTasks: Task[]; 
  createdAt?: string;
  updatedAt?: string;
  progress?: number; 
  hasFile?: boolean;
  projectName?: string; // [MỚI] Field bổ sung từ response
}