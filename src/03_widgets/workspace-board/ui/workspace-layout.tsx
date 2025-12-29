import { ReactNode } from "react";

interface WorkspaceLayoutProps {
  /** Slot chứa danh sách Task (Cột trái) */
  sidebar: ReactNode;
  /** Slot chứa chi tiết Task (Cột phải) */
  content: ReactNode;
}

export const WorkspaceLayout = ({ sidebar, content }: WorkspaceLayoutProps) => {
  return (
    // h-[calc(100vh-64px)]: Trừ đi chiều cao Header (thường là 64px) để full màn hình không bị scroll body
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-50">
      
      {/* CỘT TRÁI: Fixed Width 400px */}
      <aside className="w-[400px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        {sidebar}
      </aside>

      {/* CỘT PHẢI: Flex 1 (Chiếm hết chỗ còn lại) */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {content}
      </main>
    </div>
  );
};