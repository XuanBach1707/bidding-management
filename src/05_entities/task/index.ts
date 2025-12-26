// 1. API Service
// (Lưu ý: Tên file lúc nãy ta tạo là task.api.ts nên import từ task.api)
export { taskApi } from "./api/task-api"; 
export type { UpdateTaskDto } from "./api/task-api"; // [MỚI] Export thêm DTO Update

// 2. Schemas & Enums (Dùng để validate hoặc định nghĩa schema form)
export {
  CreateTaskSchema,
  TaskAssignmentSchema,
  SecurityLevelEnum,
  AssignmentTypeEnum,
  UserRoleEnum,
  TaskStatusEnum,
  TaskPriorityEnum,
  TaskTagEnum,
  TaskTypeEnum        // <--- [MỚI] Schema Zod cho TaskType
} from "./model/schemas";

// 3. Values (Dùng làm hằng số, ví dụ: TaskType.DRAFTING)
export { 
  TaskPriority, 
  TaskTag,
  TaskType,           // <--- [MỚI] Giá trị Enum cho Dropdown
  AssignmentType      // <--- [FIX LỖI] Export object AssignmentType
} from "./model/types";

// 4. Interfaces & Types (Dùng để định nghĩa kiểu dữ liệu TS)
export type {
  CreateTaskDto,
  TaskAssignment,
  TaskStatus,
  Task,
  
        // <--- [MỚI] Kiểu dữ liệu TaskType
} from "./model/types";