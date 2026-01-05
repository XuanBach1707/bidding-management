import { TaskAssignment, TaskTag } from "@/entities/task"; 
import { DriveItem } from "@/entities/drive";

export interface TempTask {
  id: string;
  name: string;
  deadline: Date | undefined;
  parentId: string | null;
  isFixed: boolean;
  assignments: TaskAssignment[];
  assigneeId?: number;
  
  selectedBoardId?: number; 
  
  // Tag: null = Group (chỉ là thư mục chứa), Có giá trị = Task cụ thể
  tag: TaskTag | null; 

  // Chứa danh sách file tự động lấy từ Drive
  files?: DriveItem[]; 
  
  // Dùng để định nghĩa cấu trúc ban đầu, sau đó sẽ được làm phẳng (flatten) trong hook
  subTasks?: TempTask[];
}

// CẤU TRÚC MỚI: DẠNG CÂY (NESTED) KHỚP VỚI DRIVE
export const DEFAULT_PROJECT_STRUCTURE = [
  {
    name: " HSPL, BCTC, HDTT, TTLD",
    tag: null, // Group
    subTasks: [
      { name: "Hồ sơ pháp lý", tag: "LEGAL" as TaskTag },
      { name: "Báo cáo tài chính", tag: "FINANCE" as TaskTag },
      { name: "Hợp đồng tương tự", tag: "CONTRACT" as TaskTag },
    ]
  },
  {
    name: " Bảo lãnh dự thầu, CKTD",
    tag: "DBTC" as TaskTag, // Parent độc lập
    subTasks: []
  },
  {
    name: " Biện pháp thi công ",
    tag: null, // Group
    subTasks: [
      { name: "Nhân sự ", tag: "HR" as TaskTag },
      { name: "Máy móc ", tag: "DEVICE" as TaskTag },
      { name: "BPTC", tag: "TECH" as TaskTag },
    ]
  },
  {
    name: " Hồ sơ Vật tư",
    tag: "VT" as TaskTag, // Parent độc lập
    subTasks: []
  },
  {
    name: " Hồ sơ Giá",
    tag: "GIA" as TaskTag, // Parent độc lập
    subTasks: []
  }
];