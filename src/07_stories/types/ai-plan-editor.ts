export interface EditorAssignee {
  id: string;
  name: string;
  initials: string;
}

export interface PlanNode {
  id: string; // Unique ID (dùng uuid cho dòng mới tạo)
  code: string; // 1.1, 1.2 (Frontend tự tính hoặc BE trả)
  name: string;
  assigneeId: string | null; // Chỉ lưu ID để bind vào Select
  deadline: string;
  confidence: number;
  // QUAN TRỌNG: Cấu trúc lồng nhau
  children?: PlanNode[]; 
}