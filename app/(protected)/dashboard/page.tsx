import {    DashboardPage } from '@/pages/dashboard';
// Metadata cho SEO (Next.js support)
export const metadata = {
  title: 'Dashboard Nghiệp vụ | PMS Construction',
  description: 'Trang dashboard nghiệp vụ quản lý gói thầu',
};
export default function Route() {
  // Router chỉ việc render Page
  return <DashboardPage />;
}
