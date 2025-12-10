import { LoginPage } from "@/02_pages/login";

// Metadata cho SEO (Next.js support)
export const metadata = {
  title: "Đăng nhập | PMS Construction",
  description: "Trang đăng nhập hệ thống",
};

export default function Route() {
  // Router chỉ việc render Page
  return <LoginPage />;
}