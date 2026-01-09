import { ReactNode } from "react";

interface WorkspaceLayoutProps {
  /** Slot chứa danh sách Task (Cột trái) */
  sidebar: ReactNode;
  /** Slot chứa chi tiết Task (Cột phải) */
  content: ReactNode;
}

export const WorkspaceLayout = ({ sidebar, content }: WorkspaceLayoutProps) => {
  return (
    // [UPDATE] Design System: Sử dụng bg-slate-50
    // h-[calc(100vh-64px)]: Trừ đi chiều cao Header (64px)
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50">
      
      {/* CỘT TRÁI: Fixed Width 400px */}
      {/* [UPDATE] Thêm shadow nhẹ z-10 để tách biệt lớp với nội dung chính */}
      <aside className="w-[400px] flex-shrink-0 border-r border-slate-200 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        {sidebar}
      </aside>

      {/* CỘT PHẢI: Flex 1 (Chiếm hết chỗ còn lại) */}
      {/* [UPDATE] Nền bg-slate-50/50 để tạo độ sâu cho các Card bên trong */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
        {content}
      </main>
    </div>
  );
};