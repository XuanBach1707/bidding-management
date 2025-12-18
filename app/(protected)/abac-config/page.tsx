import { Metadata } from "next";
// Import từ tầng Pages của FSD
// Lưu ý: Alias '@' trỏ vào 'src'. Tùy vào tsconfig của bạn mà đường dẫn có thể là:
// '@/02_pages/abac-config' hoặc '@/pages/abac-config' (nếu bạn có path alias riêng)
import { AbacConfigPage } from "@/02_pages/abac-config"; 

export const metadata: Metadata = {
  title: "Cấu hình Phân quyền (ABAC) | Đấu Thầu Pro",
  description: "Quản lý chính sách truy cập hệ thống",
};

export default function AbacPage() {
  return <AbacConfigPage />;
}