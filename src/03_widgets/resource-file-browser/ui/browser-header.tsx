import { ChevronRight, Home, Search } from "lucide-react";

export interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BrowserHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (index: number) => void;
  onSearch: (query: string) => void;
  searchValue: string; // [MỚI] Nhận giá trị từ cha để control input
}

export const BrowserHeader = ({ 
  breadcrumbs, 
  onBreadcrumbClick, 
  onSearch,
  searchValue // [MỚI]
}: BrowserHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      {/* 1. Breadcrumbs Area */}
      <div className="flex items-center flex-wrap gap-2 text-sm">
        <button 
          onClick={() => onBreadcrumbClick(0)} 
          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition font-medium"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Kho tài liệu</span>
        </button>
        
        {breadcrumbs.slice(1).map((crumb, index) => (
          <div key={crumb.id} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <button
              onClick={() => onBreadcrumbClick(index + 1)}
              className={`max-w-[150px] truncate transition ${
                index === breadcrumbs.length - 2
                  ? "text-slate-900 font-bold pointer-events-none"
                  : "text-slate-500 hover:text-blue-600"
              }`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* 2. Search Area */}
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        
        <input
          type="text"
          placeholder="Tìm kiếm tài liệu..."
          value={searchValue} // [QUAN TRỌNG]: Gán value để clear được từ bên ngoài
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>
    </div>
  );
};