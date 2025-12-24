// widgets/create-project-modal/model/create-project.model.ts

import { TaskAssignment } from "@/entities/task";
import { DriveItem } from "@/entities/drive"; // Import Type DriveItem mới

export interface TempTask {
  id: string;
  name: string;
  deadline: Date | undefined;
  parentId: string | null;
  isFixed: boolean;
  assignments: TaskAssignment[];
  assigneeId?: number;
  
  selectedBoardId?: number; 
  
  // [MỚI] Chứa danh sách file tự động lấy từ Drive
  files?: DriveItem[]; 
}

export const FIXED_SECTIONS = [
  { id: "fixed_1", name: "Hồ sơ pháp lý", keywords: ["Pháp chế", "Hành chính", "Tổng hợp", "Pháp lý"] },
  { id: "fixed_2", name: "Hồ sơ nhân sự", keywords: ["Nhân sự", "Tổ chức"] },
  { id: "fixed_3", name: "Biện pháp thi công", keywords: ["Kỹ thuật", "Thi công", "Dự án"] },
  { id: "fixed_4", name: "Hồ sơ tài chính", keywords: ["Tài chính", "Kế toán"] },
  { id: "fixed_5", name: "Hồ sơ máy móc", keywords: ["Vật tư", "Thiết bị", "Cơ giới"] },
  { id: "fixed_6", name: "Hồ sơ hợp đồng & Tương tự", keywords: ["Đấu thầu", "Kinh doanh"] },
];