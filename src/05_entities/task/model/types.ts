import { z } from "zod";
import { 
  CreateTaskSchema, 
  TaskAssignmentSchema, 
  TaskStatusEnum,
  AssignmentTypeEnum, 
  UserRoleEnum
} from "./schemas";

export const AssignmentType = AssignmentTypeEnum.enum; 

// --- 1. Thêm Types phụ trợ cho User và Unit ---
export interface SimpleUser {
  full_name: string;
  avatar_url?: string; // Optional
}

export interface SimpleUnit {
  unit_name: string;
}

// --- 2. Cập nhật TaskAssignment ---
export interface TaskAssignment {
  assignment_id: number; // Mapping theo JSON trả về (snake_case)
  assigned_unit_id: number | null;
  assigned_user_id: number | null;
  assignment_type: string; // "MAIN", "SUPPORT", "REVIEW"
  required_role: string;
  is_accepted: boolean;
  
  // [QUAN TRỌNG] Object lồng nhau từ API
  user?: SimpleUser | null;
  unit?: SimpleUnit | null;
}

// --- 3. Cập nhật Task Interface chính ---
export interface Task {
  id: number;
  task_name: string;
  deadline: string | null;
  status: string; // OPEN, IN_PROGRESS, ...
  priority: string | null;
  task_type: string;
  description: string | null;
  project_name: string | null;
  
  // Thông tin liên kết
  bidding_project_id: number | null;
  parent_task_id: number | null;
  
  // Danh sách phân công (để lấy tên người làm)
  assignments: TaskAssignment[]; 
  
  // Task con
  sub_tasks: Task[]; 
  
  // Các trường khác
  tag?: string | null;
  source_type?: string;
}