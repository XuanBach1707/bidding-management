import { z } from "zod";

// --- ENUMS ---
// Dùng z.nativeEnum cho object số (khớp với BE)
export const SecurityLevelEnum = z.nativeEnum({
  PUBLIC: 1,
  INTERNAL: 2,
  CONFIDENTIAL: 3,
  SECRET: 4,
});

// Dùng z.enum cho chuỗi
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

// --- SUB-SCHEMA: Task Assignment ---
export const TaskAssignmentSchema = z.object({
  // [FIX] Đã bỏ config message lỗi để tránh lỗi type, chỉ để z.number() đơn giản
  assignedUnitId: z.number(), 
  
  requiredRole: UserRoleEnum.default("SPECIALIST"),
  // BE trả về số (1,2,3,4) nên dùng z.number(), mặc định là 2 (INTERNAL)
  requiredMinSecurity: z.number().default(2), 
  assignmentType: AssignmentTypeEnum.default("MAIN"),
  
  // Có thể null hoặc optional
  assignedUserId: z.number().nullable().optional(),
  isAccepted: z.boolean().default(false),
});

// --- MAIN SCHEMA: Create Task ---
export const CreateTaskSchema = z.object({
  biddingProjectId: z.number(), 
  
  // ID cha (nếu tạo subtask), có thể null hoặc optional
  parentTaskId: z.number().nullable().optional(), 

  taskName: z.string().min(1, "Tên công việc không được để trống"),
  deadline: z.string().nullable().optional(), // ISO String
  description: z.string().nullable().optional(),
  
  status: TaskStatusEnum.default("OPEN"),
  isMilestone: z.boolean().default(false),
  sourceType: z.string().default("USER"), 

  assigneeId: z.number().nullable().optional(),
  reviewerId: z.number().nullable().optional(),

  // Mảng phân công, mặc định rỗng
  assignments: z.array(TaskAssignmentSchema).default([]),
});

// Export type để dùng cho Form React Hook Form
export type CreateTaskFormValues = z.infer<typeof CreateTaskSchema>;