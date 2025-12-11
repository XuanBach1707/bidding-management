export type AIStatus = 'ready' | 'limited' | 'none';
export type FooterType = 'progress' | 'action';

export interface ProjectCardData {
  id: string;
  code: string;       // TBMT-2025-00128
  title: string;      // Xây dựng trường tiểu học...
  investor: string;   // Ban QLDA...
  aiStatus: AIStatus; // Để chỉnh màu cái chấm (Xanh/Cam/Xám)
  
  // Logic biến đổi Footer
  footerType: FooterType;
  progress?: {        // Dữ liệu nếu là thanh tiến độ
    daysLeft: number;
    percent: number;
  };
  action?: {          // Dữ liệu nếu là nút bấm
    label: string;
    targetUrl?: string;
  };
}