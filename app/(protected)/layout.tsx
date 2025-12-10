import AuthGuard from "@/features/auth/ui/auth-guard"; // Đường dẫn AuthGuard của bạn
import { Sidebar } from "@/widgets/layout/ui/sidebar"; // Import Sidebar vừa làm xong

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="relative flex min-h-screen bg-gray-100">
        
        {/* --- 1. SIDEBAR (Cột trái) --- */}
        {/* hidden md:flex: Tạm thời ẩn trên mobile, hiện trên desktop */}
        {/* fixed: Ghim cứng một chỗ */}
        <aside className="hidden md:flex h-full w-[250px] flex-col fixed inset-y-0 z-50">
           <Sidebar />
        </aside>

        {/* --- 2. MAIN CONTENT (Cột phải) --- */}
        {/* md:pl-[250px]: Đẩy lùi vào 250px để nhường chỗ cho sidebar */}
        <main className="flex-1 md:pl-[250px]">
           {/* Thêm padding p-8 để nội dung không dính sát lề */}
           <div className="p-8">
               {children}
           </div>
        </main>
        
      </div>
    </AuthGuard>
  );
}