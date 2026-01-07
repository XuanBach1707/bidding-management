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

// [QUAN TRỌNG] Đã cập nhật đủ các Tag mới để khớp với Constants
export const TaskTagEnum = z.enum([
  "LEGAL",    // Hồ sơ pháp lý
  "FINANCE",  // Hồ sơ tài chính
  "TECH",     // Biện pháp thi công
  "CONTRACT", // Hồ sơ hợp đồng tương tự
  "DEVICE",   // Hồ sơ máy móc thiết bị
  "HR",       // Hồ sơ nhân sự
  "OTHER",    // Hồ sơ khác
  "DBTC",     // Bảo lãnh dự thầu, Cam kết tín dụng
  "VT",       // Vật tư
  "GIA"       // Giá
]);

export const TaskTypeEnum = z.enum([
  "AUTO",      // Tự động (Hệ thống/AI)
  "SELECTION", // Chọn tài liệu
  "DRAFTING"   // Soạn thảo
]);

// --- SUB-SCHEMA: Task Assignment ---
// [QUAN TRỌNG] Đã thêm user và unit để hứng dữ liệu tên nhân viên
export const TaskAssignmentSchema = z.object({
  assignmentId: z.number().optional(), // API trả về assignment_id
  assignedUnitId: z.number(), 
  requiredRole: UserRoleEnum.default("SPECIALIST"),
  requiredMinSecurity: z.number().default(2), 
  assignmentType: AssignmentTypeEnum.default("MAIN"),
  assignedUserId: z.number().nullable().optional(),
  isAccepted: z.boolean().default(false),

  // Object User (Interceptor sẽ camelCase: full_name -> fullName)
  user: z.object({
    fullName: z.string().optional(),
    email: z.string().optional(),
    avatarUrl: z.string().optional(),
  }).nullable().optional(),

  // Object Unit (Interceptor: unit_name -> unitName)
  unit: z.object({
    unitName: z.string().optional(),
  }).nullable().optional(),
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
  tag: TaskTagEnum.nullable().optional(),
  taskType: TaskTypeEnum.default("DRAFTING"),
  sourceType: z.string().default("USER"), 

  assigneeId: z.number().nullable().optional(),
  reviewerId: z.number().nullable().optional(),
  templateId: z.number().nullable().optional(),
  
  // Mảng chuỗi (URL file đính kèm)
  attachmentUrl: z.array(z.string()).default([]),

  assignments: z.array(TaskAssignmentSchema).default([]),
});

export type CreateTaskFormValues = z.infer<typeof CreateTaskSchema>;