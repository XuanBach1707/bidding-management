"use client";

import AuthGuard from "@/features/auth/ui/auth-guard";
// Import cả 2 component Sidebar (Desktop) và MobileSidebar (Mobile)
import { Sidebar, MobileSidebar } from "@/widgets/layout/ui/sidebar"; 
import { AuthProvider } from "@/features/auth/model/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex h-screen w-full overflow-hidden bg-gray-100">
          
          {/* --- 1. CỘT TRÁI (DESKTOP SIDEBAR) --- */}
          {/* Thêm class 'hidden md:block': Ẩn trên mobile, hiện trên màn hình desktop (md trở lên) */}
          <aside className="hidden md:block w-[260px] flex-shrink-0 border-r bg-white shadow-sm z-10">
              <Sidebar />
          </aside>

          {/* --- 2. CỘT PHẢI (MAIN CONTENT AREA) --- */}
          <div className="flex flex-1 flex-col h-full overflow-hidden">
            
            {/* [MỚI] MOBILE HEADER: Chỉ hiện trên Mobile */}
            {/* md:hidden nghĩa là ẩn khi màn hình to */}
            <header className="flex md:hidden h-14 items-center gap-4 border-b bg-white px-4 shrink-0">
               {/* Nút mở Menu Mobile đặt ở đây */}
               <MobileSidebar /> 
               
               {/* Tên tiêu đề cho mobile để người dùng biết đang ở đâu */}
               <span className="font-bold text-slate-800 text-sm uppercase">
                 PC1 Bidding Hub
               </span>
            </header>

            {/* NỘI DUNG CHÍNH */}
            <main className="flex-1 overflow-y-auto bg-slate-50 relative custom-scrollbar">
                {/* Điều chỉnh padding: Mobile p-4, Desktop p-8 cho thoáng */}
                <div className="p-4 md:p-8 min-h-full">
                    {children}
                </div>
            </main>
          </div>
          
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}