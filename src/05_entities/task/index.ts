// 1. API Service
export { taskApi } from "./api/task-api";

// 2. Schemas & Enums
export {
  CreateTaskSchema,
  TaskAssignmentSchema,
  SecurityLevelEnum,
  AssignmentTypeEnum,
  UserRoleEnum,
  TaskStatusEnum,
  TaskPriorityEnum,
  TaskTagEnum       // <--- [MỚI] Phải export thêm cái này để dùng Zod validate hoặc mapping
} from "./model/schemas";

// 3. Types
export { 
  TaskPriority,     // <--- [MỚI] Export thêm Enum thô (dạng Object) nếu cần dùng ở UI
  TaskTag           // <--- [MỚI] Export thêm Enum thô để mapping tag hồ sơ
} from "./model/types";

export type {
  CreateTaskDto,
  TaskAssignment,
  TaskStatus,
  TaskPriority as TaskPriorityType, // Export type để tránh trùng tên nếu cần
  TaskTag as TaskTagType,           // <--- [MỚI] Export type: "LEGAL" | "FINANCE" | ...
  Task
} from "./model/types";