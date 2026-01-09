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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
      
      {/* 1. Breadcrumbs Area */}
      <div className="flex items-center flex-wrap gap-1 text-sm">
        <button 
          onClick={() => onBreadcrumbClick(0)} 
          className="flex items-center gap-1.5 text-slate-500 hover:text-[#009d98] hover:bg-[#009d98]/5 px-2 py-1.5 rounded-md transition font-medium"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Kho tài liệu</span>
        </button>
        
        {breadcrumbs.slice(1).map((crumb, index) => (
          <div key={crumb.id} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <button
              onClick={() => onBreadcrumbClick(index + 1)}
              className={`flex items-center gap-1.5 max-w-[150px] truncate px-2 py-1.5 rounded-md transition ${
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

      {/* 2. Search Area */}
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Tìm kiếm tài liệu..."
          value={searchValue} 
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9 h-10 bg-slate-50 border-slate-200 focus-visible:ring-[#009d98] focus-visible:bg-white transition-all"
        />
      </div>
    </div>
  );
};