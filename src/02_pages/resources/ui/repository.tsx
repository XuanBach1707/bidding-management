"use client";

import { FolderKanban } from "lucide-react"; // Icon đại diện cho Kho
import { ResourceFileBrowser } from "@/widgets/resource-file-browser";

export const ResourceRepositoryPage = () => {
  return (
    // 1. Root: Nền xám nhẹ, Full chiều cao màn hình
    <div className="flex flex-col h-full min-h-screen bg-slate-50/50 font-sans">
      
      {/* 2. Container chính: Giới hạn chiều rộng, padding chuẩn */}
      <div className="container mx-auto max-w-7xl p-6 md:p-8 flex-1 flex flex-col min-h-0">
        
        {/* --- PAGE HEADER --- */}
        <div className="flex items-center gap-3 mb-6 shrink-0 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-2.5 bg-[#009d98]/10 rounded-xl shadow-sm">
            <FolderKanban className="w-6 h-6 text-[#009d98]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Kho tài liệu chung
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Tra cứu, quản lý văn bản và hồ sơ năng lực tập trung.
            </p>
          </div>
        </div>

        {/* --- MAIN WIDGET AREA --- */}
        {/* flex-1 min-h-0: Quan trọng để scroll nằm bên trong widget này chứ không phải scroll cả trang */}
        <div className="flex-1 min-h-0 relative">
           {/* ResourceFileBrowser đã được thiết kế h-full bên trong, nên nó sẽ fill vừa khít khu vực này */}
           <ResourceFileBrowser />
        </div>

      </div>
    </div>
  );
};