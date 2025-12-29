import { z } from "zod";
import { 
  CreateTaskSchema, 
  TaskAssignmentSchema, 
  TaskStatusEnum,
  AssignmentTypeEnum, 
  UserRoleEnum,
  TaskPriorityEnum,
  TaskTagEnum,
  TaskTypeEnum 
} from "./schemas";

// 1. Export Enum Value
export const AssignmentType = AssignmentTypeEnum.enum; 
export const TaskPriority = TaskPriorityEnum.enum;
export const TaskTag = TaskTagEnum.enum;
export const TaskType = TaskTypeEnum.enum; 

// 2. Types inferred
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusEnum>;
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;
export type TaskTag = z.infer<typeof TaskTagEnum>;
export type TaskType = z.infer<typeof TaskTypeEnum>;

// 3. Entity Interfaces
export interface TaskAssignment {
  assignmentId: number;
  assignedUnitId: number;
  assignedUserId: number | null;
  assignmentType: z.infer<typeof AssignmentTypeEnum>;
  requiredRole: z.infer<typeof UserRoleEnum>;
  requiredMinSecurity: number;
  isAccepted: boolean;
  
  user?: {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  } | null;

  unit?: {
    unitName?: string;
  } | null;
}

export interface Task extends Omit<CreateTaskDto, 'assignments'> {
  id: number;
  assignments: TaskAssignment[]; 
  subTasks: Task[]; 
  createdAt?: string;
  updatedAt?: string;
  progress?: number; 
  hasFile?: boolean;
  projectName?: string; 
  // attachmentUrl sẽ tự động là string[] nhờ CreateTaskDto
}