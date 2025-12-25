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

export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

// [MỚI] Enum cho Task Tag theo yêu cầu Backend
export const TaskTagEnum = z.enum([
  "LEGAL",    // Hồ sơ pháp lý
  "FINANCE",  // Hồ sơ tài chính
  "TECH",     // Biện pháp thi công
  "CONTRACT", // Hồ sơ hợp đồng tương tự
  "DEVICE",   // Hồ sơ máy móc thiết bị
  "HR",       // Hồ sơ nhân sự
  "OTHER"     // Hồ sơ khác
]);

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
  id: z.number().optional(), 
  biddingProjectId: z.number(), 
  
  parentTaskId: z.number().nullable().optional(), 

  taskName: z.string().min(1, "Tên công việc không được để trống"),
  deadline: z.string().nullable().optional(), 
  description: z.string().nullable().optional(),
  
  status: TaskStatusEnum.default("OPEN"),
  priority: TaskPriorityEnum.default("MEDIUM"), 
  
  // [MỚI] Bổ sung trường tag vào request gửi lên API
  tag: TaskTagEnum.default("OTHER"),
  
  sourceType: z.string().default("USER"), 

  assigneeId: z.number().nullable().optional(),
  reviewerId: z.number().nullable().optional(),

  assignments: z.array(TaskAssignmentSchema).default([]),
});

export type CreateTaskFormValues = z.infer<typeof CreateTaskSchema>;