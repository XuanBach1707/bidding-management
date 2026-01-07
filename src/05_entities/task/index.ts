// 1. API Service
export { taskApi } from "./api/task-api"; 
export type { UpdateTaskDto } from "./api/task-api";

// 2. Schemas & Enums (Dùng để validate)
export {
  CreateTaskSchema,
  TaskAssignmentSchema,
  SecurityLevelEnum,
  AssignmentTypeEnum,
  UserRoleEnum,
  TaskStatusEnum,
  TaskPriorityEnum,
  TaskTagEnum,
  TaskTypeEnum
} from "./model/schemas";

// 3. Constants & Configs (QUAN TRỌNG: Để dùng Label, Color ở UI)
export { 
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  TASK_TAG_LABEL,
  TASK_TYPE_LABEL
} from "./model/constants"; 

// 4. Enum Values (Dùng làm hằng số so sánh logic)
export { 
  TaskPriority, 
  TaskTag,
  TaskType,
  AssignmentType 
} from "./model/types";

// 5. Interfaces & Types (Kiểu dữ liệu TypeScript)
export type {
  CreateTaskDto,
  TaskAssignment,
  TaskStatus,
  Task,
} from "./model/types";