import { TaskStatusEnum, TaskPriorityEnum, TaskTagEnum, TaskTypeEnum } from "./schemas";
import { z } from "zod";

// 1. Config cho Status
export const TASK_STATUS_CONFIG: Record<z.infer<typeof TaskStatusEnum>, { label: string; color: string; icon?: string }> = {
  OPEN: { 
    label: "Mới tạo", 
    color: "text-slate-500 bg-slate-100 border-slate-200" 
  },
  ASSIGNED: { 
    label: "Đã giao", 
    color: "text-blue-600 bg-blue-50 border-blue-200" 
  },
  IN_PROGRESS: { 
    label: "Đang làm", 
    color: "text-indigo-600 bg-indigo-50 border-indigo-200" 
  },
  PENDING_REVIEW: { 
    label: "Chờ duyệt", 
    color: "text-orange-600 bg-orange-50 border-orange-200" 
  },
  COMPLETED: { 
    label: "Hoàn thành", 
    color: "text-green-600 bg-green-50 border-green-200" 
  },
  REJECTED: { 
    label: "Trả lại", 
    color: "text-red-600 bg-red-50 border-red-200" 
  },
};

// 2. Config cho Priority (Dùng cho Badge)
export const TASK_PRIORITY_CONFIG: Record<z.infer<typeof TaskPriorityEnum>, { label: string; color: string }> = {
  HIGH: { label: "Gấp", color: "text-red-600 bg-red-50 border-red-200" },
  MEDIUM: { label: "Thường", color: "text-blue-600 bg-blue-50 border-blue-200" },
  LOW: { label: "Thấp", color: "text-slate-500 bg-slate-100 border-slate-200" },
};

// 3. Config cho Tag (Đã sửa lỗi thiếu key)
export const TASK_TAG_LABEL: Record<z.infer<typeof TaskTagEnum>, string> = {
  LEGAL: "Pháp lý",
  FINANCE: "Tài chính",
  TECH: "Kỹ thuật",
  CONTRACT: "Hợp đồng",
  DEVICE: "Thiết bị",
  HR: "Nhân sự",
  OTHER: "Khác",
  
  // Các Key mới thêm vào Enum
  DBTC: "Bảo lãnh / CKTD",
  VT: "Vật tư",
  GIA: "Hồ sơ Giá"
};

// 4. Config cho Type
export const TASK_TYPE_LABEL: Record<z.infer<typeof TaskTypeEnum>, string> = {
  AUTO: "Tự động",
  SELECTION: "Chọn lọc",
  DRAFTING: "Soạn thảo"
};