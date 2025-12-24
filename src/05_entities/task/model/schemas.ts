import { z } from "zod";

// --- ENUMS ---
export const SecurityLevelEnum = z.nativeEnum({
  PUBLIC: 1,
  INTERNAL: 2,
  CONFIDENTIAL: 3,
  SECRET: 4,
});

export const AssignmentTypeEnum = z.enum(["MAIN", "SUPPORT", "REVIEW"]);

export const UserRoleEnum = z.enum([
  "ADMIN", 
  "MANAGER", 
  "BID_MANAGER", 
  "SPECIALIST", 
  "ENGINEER", 
  "JKAN"
]);

export const TaskStatusEnum = z.enum([
  "OPEN", "ASSIGNED", "IN_PROGRESS", "PENDING_REVIEW", "COMPLETED", "REJECTED"
]);

// [MỚI] Enum cho mức độ ưu tiên
export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

// --- SUB-SCHEMA: Task Assignment ---
export const TaskAssignmentSchema = z.object({
  assignedUnitId: z.number(), 
  requiredRole: UserRoleEnum.default("SPECIALIST"),
  requiredMinSecurity: z.number().default(2), 
  assignmentType: AssignmentTypeEnum.default("MAIN"),
  assignedUserId: z.number().nullable().optional(),
  isAccepted: z.boolean().default(false),
});

// --- MAIN SCHEMA: Create Task ---
export const CreateTaskSchema = z.object({
  id: z.number().optional(), // Thêm optional ID vì update có thể cần
  biddingProjectId: z.number(), 
  
  parentTaskId: z.number().nullable().optional(), 

  taskName: z.string().min(1, "Tên công việc không được để trống"),
  deadline: z.string().nullable().optional(), // ISO String
  description: z.string().nullable().optional(),
  
  status: TaskStatusEnum.default("OPEN"),
  
  // [SỬA ĐỔI] Thay isMilestone bằng priority
  priority: TaskPriorityEnum.default("MEDIUM"), 
  
  sourceType: z.string().default("USER"), 

  assigneeId: z.number().nullable().optional(),
  reviewerId: z.number().nullable().optional(),

  assignments: z.array(TaskAssignmentSchema).default([]),
});

export type CreateTaskFormValues = z.infer<typeof CreateTaskSchema>;