// app/(dashboard)/dashboard/page.tsx

// Import từ Public API của layer 01_app
import { DashboardSwitcher } from "@/01_app/dashboard"; 

export const metadata = {
  title: 'Dashboard | PMS Construction',
  description: 'Hệ thống quản lý dự án & đấu thầu',
};

export default function DashboardRoute() {
  return <DashboardSwitcher />;
}