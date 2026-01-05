import { TaskAssignment, TaskTag } from "@/entities/task"; 
import { DriveItem } from "@/entities/drive";

// Interface cho Structure Log trả về từ API Init Project
export interface DriveStructureItem {
  name: string;
  id: string;      // Đây là target_folder_id
  type: "PARENT" | "CHILD";
  parent?: string;
  tag: TaskTag | null; // Key quan trọng để map với Task
}

// [UPDATED] Interface cho Response của API Init Project
// Đã chuyển sang camelCase để khớp với Interceptor
export interface InitProjectResponse {
  message: string;
  projectId: number;      // server: project_id
  projectName: string;    // server: project_name
  driveFolderId: string;  // server: drive_folder_id
  driveData: {            // server: drive_data
    projectName: string;  // server: project_name
    projectId: string;    // server: project_id
    structureLog: DriveStructureItem[]; // server: structure_log
  };
}

export interface TempTask {
  id: string;
  name: string;
  deadline: Date | undefined;
  parentId: string | null;
  isFixed: boolean;
  assignments: TaskAssignment[];
  assigneeId?: number;
  
  selectedBoardId?: number; 
  
  // Tag: null = Group, Có giá trị = Task cụ thể
  tag: TaskTag | null; 

  // Chứa danh sách file tự động lấy từ Drive (Kho tài liệu)
  files?: DriveItem[]; 
  
  subTasks?: TempTask[];
}

// CẤU TRÚC MỚI: DẠNG CÂY (NESTED)
export const DEFAULT_PROJECT_STRUCTURE = [
  {
    name: " HSPL, BCTC, HDTT, TTLD",
    tag: null, 
    subTasks: [
      { name: "Hồ sơ pháp lý", tag: "LEGAL" as TaskTag },
      { name: "Báo cáo tài chính", tag: "FINANCE" as TaskTag },
      { name: "Hợp đồng tương tự", tag: "CONTRACT" as TaskTag },
    ]
  },
  {
    name: " Bảo lãnh dự thầu, CKTD",
    tag: "DBTC" as TaskTag,
    subTasks: []
  },
  {
    name: " Biện pháp thi công ",
    tag: null, 
    subTasks: [
      { name: "Nhân sự ", tag: "HR" as TaskTag },
      { name: "Máy móc ", tag: "DEVICE" as TaskTag },
      { name: "BPTC", tag: "TECH" as TaskTag },
    ]
  },
  {
    name: " Hồ sơ Vật tư",
    tag: "VT" as TaskTag,
    subTasks: []
  },
  {
    name: " Hồ sơ Giá",
    tag: "GIA" as TaskTag,
    subTasks: []
  }
];