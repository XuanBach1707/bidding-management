"use client";

import { FolderKanban } from "lucide-react"; 
import { ResourceFileBrowser } from "@/widgets/resource-file-browser";

export const ResourceRepositoryPage = () => {
  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50/50 font-sans">
      
      {/* 2. Container: Giảm padding mobile xuống p-3 hoặc p-4 */}
      <div className="container mx-auto max-w-7xl p-4 md:p-8 flex-1 flex flex-col min-h-0">
        
        {/* --- PAGE HEADER --- */}
        <div className="flex items-start md:items-center gap-3 mb-4 md:mb-6 shrink-0 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-2.5 bg-[#009d98]/10 rounded-xl shadow-sm shrink-0">
            <FolderKanban className="w-5 h-5 md:w-6 md:h-6 text-[#009d98]" />
          </div>
          <div className="min-w-0"> {/* min-w-0 giúp text truncate nếu quá dài */}
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
              Kho tài liệu chung
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium line-clamp-1 md:line-clamp-none">
              Tra cứu, quản lý văn bản và hồ sơ năng lực tập trung.
            </p>
          </div>
        </div>

        {/* --- MAIN WIDGET AREA --- */}
        <div className="flex-1 min-h-0 relative flex flex-col">
           {/* Thêm flex-col để đảm bảo con bên trong bung ra đúng */}
           <ResourceFileBrowser />
        </div>

      </div>
    </div>
  );
};