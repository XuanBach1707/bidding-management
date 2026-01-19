import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils"; // Đảm bảo bạn có hàm cn (clsx + twMerge)

interface WorkspaceLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
  /** [MỚI] Điều khiển hiển thị trên Mobile */
  showSidebarOnMobile?: boolean; 
}

export const WorkspaceLayout = ({ 
  sidebar, 
  content, 
  showSidebarOnMobile = true // Mặc định vào là hiện list trước
}: WorkspaceLayoutProps) => {
  return (
    // Sử dụng h-[100dvh] thay vì 100vh để fix lỗi thanh địa chỉ trên trình duyệt mobile
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50">
      
      {/* 1. SIDEBAR (CỘT TRÁI) 
        - Mobile: w-full (chiếm hết màn hình). Ẩn/Hiện dựa vào showSidebarOnMobile.
        - Desktop (md): Luôn hiện (flex), width cố định 400px.
      */}
      <aside className={cn(
        "flex-col border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-all",
        // Desktop styles
        "md:flex md:w-[400px] md:flex-shrink-0",
        // Mobile styles: Logic ẩn hiện
        showSidebarOnMobile ? "flex w-full" : "hidden"
      )}>
        {sidebar}
      </aside>

      {/* 2. CONTENT (CỘT PHẢI) 
        - Mobile: w-full. Chỉ hiện khi showSidebarOnMobile = false.
        - Desktop: Luôn hiện (flex-1).
      */}
      <main className={cn(
        "flex-col min-w-0 bg-slate-50/50 relative",
        // Desktop styles
        "md:flex md:flex-1",
        // Mobile styles: Logic ẩn hiện (Ngược lại với Sidebar)
        !showSidebarOnMobile ? "flex flex-1" : "hidden"
      )}>
        {content}
      </main>
    </div>
  );
};