"use client";

import AuthGuard from "@/features/auth/ui/auth-guard";
import { Sidebar } from "@/widgets/layout/ui/sidebar";
import { AuthProvider } from "@/features/auth/model/auth-context"; // [MỚI] Import Provider

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* 1. Bọc AuthProvider ở ngoài cùng của Layout này.
      Lý do: Sidebar (con của nó) dùng useAuth, nên cần Provider cung cấp context.
    */
    <AuthProvider>
      {/* 2. Bọc AuthGuard để chặn người chưa đăng nhập.
        Nếu chưa login -> Đá về trang login (không hiện nội dung bên trong).
      */}
      <AuthGuard>
        <div className="flex h-screen w-full overflow-hidden bg-gray-100">
          
          {/* CỘT TRÁI (SIDEBAR) */}
          <aside className="w-[250px] flex-shrink-0 border-r bg-white shadow-sm z-10">
             <Sidebar />
          </aside>

          {/* CỘT PHẢI (MAIN CONTENT) */}
          <main className="flex-1 overflow-y-auto bg-slate-50 relative">
             <div className="p-8 min-h-full">
                 {children}
             </div>
          </main>
          
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}