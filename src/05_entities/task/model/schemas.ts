import { z } from "zod";

// --- ENUMS (Khớp với BE) ---
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

// --- SUB-SCHEMA: Task Assignment (Phân công phòng ban) ---
export const TaskAssignmentSchema = z.object({
  // [FIX] Sửa lại config cho z.number() dựa trên thông báo lỗi của bạn
  // Dùng { message: ... } thay vì required_error/invalid_type_error
  assignedUnitId: z.number({ message: "Phải chọn phòng ban" }), 
  
  requiredRole: UserRoleEnum.default("SPECIALIST"),
  requiredMinSecurity: z.string().default("2"), 
  assignmentType: AssignmentTypeEnum.default("MAIN"),
});

// --- MAIN SCHEMA: Create Task ---
export const CreateTaskSchema = z.object({
  taskName: z.string().min(1, "Tên công việc không được để trống"),
  deadline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: TaskStatusEnum.default("OPEN"),
  isMilestone: z.boolean().default(false),
  sourceType: z.string().default("FILE"),
  biddingProjectId: z.number(),
  
  // ID cha (0 nếu là cha)
  parentTaskId: z.number().default(0),
  
  // Assignee cụ thể (User) - Optional
  // Chấp nhận cả string và number
  assigneeId: z.union([z.string(), z.number()]).optional().nullable(),
  reviewerId: z.union([z.string(), z.number()]).optional().nullable(),
  
  // Mảng phân công phòng ban
  assignments: z.array(TaskAssignmentSchema).default([]),
});