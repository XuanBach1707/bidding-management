import { ChevronRight, Home, Search, FolderOpen } from "lucide-react";
import { Input } from "@/shared/ui/input";

export interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BrowserHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (index: number) => void;
  onSearch: (query: string) => void;
  searchValue: string;
}

export const BrowserHeader = ({ 
  breadcrumbs, 
  onBreadcrumbClick, 
  onSearch,
  searchValue 
}: BrowserHeaderProps) => {
  return (
    // [UPDATE] Sticky top với z-index cao để luôn nổi khi cuộn
    <div className="flex flex-col gap-3 mb-4 md:mb-6 bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-20">
      
      {/* 1. Search Area (Đảo lên trên ở Mobile hoặc để dưới tùy UX, ở đây tôi để dưới Breadcrumb nhưng full width) */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
        
        {/* Breadcrumbs: [UPDATE] Thêm overflow-x-auto để trượt ngang trên mobile */}
        <div className="flex items-center gap-1 text-sm w-full md:w-auto overflow-x-auto whitespace-nowrap pb-1 md:pb-0 custom-scrollbar hide-scrollbar-mobile">
          <button 
            onClick={() => onBreadcrumbClick(0)} 
            className="flex-shrink-0 flex items-center gap-1.5 text-slate-500 hover:text-[#009d98] hover:bg-[#009d98]/5 px-2 py-1.5 rounded-md transition font-medium"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Kho tài liệu</span>
          </button>
          
          {breadcrumbs.slice(1).map((crumb, index) => (
            <div key={crumb.id} className="flex-shrink-0 flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <button
                onClick={() => onBreadcrumbClick(index + 1)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition max-w-[120px] md:max-w-[200px] ${
                  index === breadcrumbs.length - 2
                    ? "text-slate-800 font-bold bg-slate-100 pointer-events-none"
                    : "text-slate-500 hover:text-[#009d98] hover:bg-[#009d98]/5"
                }`}
                title={crumb.name}
              >
                {index === breadcrumbs.length - 2 && <FolderOpen className="w-4 h-4 text-[#009d98]" />}
                <span className="truncate">{crumb.name}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchValue} 
            onChange={(e) => onSearch(e.target.value)}
            // [UPDATE] text-base trên mobile để tránh lỗi iOS zoom khi focus
            className="pl-9 h-10 bg-slate-50 border-slate-200 focus-visible:ring-[#009d98] focus-visible:bg-white transition-all text-base md:text-sm"
          />
        </div>
      </div>
    </div>
  );
};