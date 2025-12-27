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

export const TaskTagEnum = z.enum([
  "LEGAL",    // Hồ sơ pháp lý
  "FINANCE",  // Hồ sơ tài chính
  "TECH",     // Biện pháp thi công
  "CONTRACT", // Hồ sơ hợp đồng tương tự
  "DEVICE",   // Hồ sơ máy móc thiết bị
  "HR",       // Hồ sơ nhân sự
  "OTHER"     // Hồ sơ khác
]);

// [MỚI] Enum cho Task Type
export const TaskTypeEnum = z.enum([
  "AUTO",       // Tự động (Hệ thống/AI)
  "SELECTION",  // Chọn tài liệu
  "DRAFTING"    // Soạn thảo
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
  
  // [CẬP NHẬT] Tag có thể null (đối với subtask)
  tag: TaskTagEnum.nullable().optional(),
  
  // [MỚI] Loại công việc
  taskType: TaskTypeEnum.default("DRAFTING"),

  sourceType: z.string().default("USER"), 

  assigneeId: z.number().nullable().optional(),
  reviewerId: z.number().nullable().optional(),

  // [MỚI] Các trường bổ sung từ API
  templateId: z.number().nullable().optional(),
  attachmentUrl: z.string().nullable().optional(),

  assignments: z.array(TaskAssignmentSchema).default([]),
});

export type CreateTaskFormValues = z.infer<typeof CreateTaskSchema>;