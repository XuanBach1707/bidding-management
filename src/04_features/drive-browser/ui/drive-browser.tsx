"use client";

import React from "react";
import { 
  Folder, 
  FileText, 
  File, 
  FileImage, 
  ChevronRight, 
  RefreshCw, 
  LayoutGrid,
  Home,
  Search, 
  X,
  FolderOpen 
} from "lucide-react"; 
import { useDriveBrowser } from "../model/use-drive-browser";
import { DriveItemType } from "@/entities/drive/model/types";
import { cn } from "@/shared/lib/utils"; 

// --- HELPER: Render Icon ---
const DriveIcon = ({ type, name }: { type: string; name: string }) => {
  const isFolder = type === DriveItemType.FOLDER || type === "FOLDER";
  
  if (isFolder) {
    return <Folder className="w-8 h-8 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />;
  }

  const ext = name.split(".").pop()?.toLowerCase();
  
  // Mobile icon to hơn (w-8 h-8) để dễ nhìn, PC nhỏ gọn (w-5 h-5)
  const iconClass = "w-8 h-8 md:w-5 md:h-5"; 

  if (["doc", "docx"].includes(ext || "")) return <FileText className={`${iconClass} text-blue-600`} />;
  if (["xls", "xlsx", "csv"].includes(ext || "")) return <FileText className={`${iconClass} text-green-600`} />;
  if (["pdf"].includes(ext || "")) return <FileText className={`${iconClass} text-red-600`} />;
  if (["png", "jpg", "jpeg"].includes(ext || "")) return <FileImage className={`${iconClass} text-purple-600`} />;
  
  return <File className={`${iconClass} text-gray-400`} />;
};

export const DriveBrowser = () => {
  const {
    items,
    loading,
    error,
    breadcrumbs,
    handleItemClick,
    handleBreadcrumbClick,
    refresh,
    searchTerm,
    setSearchTerm,
    clearSearch
  } = useDriveBrowser();

  return (
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm font-sans text-sm overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="px-3 md:px-4 py-2 md:py-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-white sticky top-0 z-10 gap-3 md:gap-4 shrink-0">
        
        {/* 1. Breadcrumbs: Mobile Scroll ngang */}
        <div className="flex items-center overflow-x-auto no-scrollbar whitespace-nowrap gap-1 text-slate-600 flex-1 min-w-0 pb-1 md:pb-0">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id || "root"}>
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 mx-0.5 md:mx-1 flex-shrink-0" />}
                
                <button
                  onClick={() => handleBreadcrumbClick(crumb, index)}
                  disabled={isLast && !searchTerm} 
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-1 rounded transition-colors max-w-[120px] md:max-w-[200px]",
                    (isLast && !searchTerm)
                      ? "font-bold text-slate-900 cursor-default bg-slate-50 md:bg-transparent" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-[#009d98]"
                  )}
                  title={crumb.name}
                >
                  {index === 0 && <Home className="w-3.5 h-3.5 md:w-4 md:h-4 mr-0.5"/>}
                  <span className="truncate text-xs md:text-sm">{crumb.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* 2. Search & Refresh */}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          {/* SEARCH INPUT: Full width on mobile */}
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#009d98] transition-colors" />
            <input 
              type="text"
              placeholder="Tìm kiếm..." 
              className="w-full md:w-64 pl-9 pr-8 py-2 md:py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#009d98] focus:border-[#009d98] transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="h-5 w-[1px] bg-slate-200 hidden md:block"></div>

          <button 
            onClick={refresh} 
            disabled={loading}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 shrink-0"
            title="Làm mới"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-[#009d98]")} />
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-auto bg-slate-50/30">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
            <span className="text-sm font-medium">{error}</span>
            <button onClick={refresh} className="underline text-xs hover:text-red-700">Thử lại</button>
          </div>
        ) : (
          <>
            {/* --- 1. MOBILE VIEW (LIST) - Hiện trên màn hình nhỏ --- */}
            <div className="block md:hidden">
                {loading && items.length === 0 ? (
                    <div className="p-4 space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length > 0 ? (
                    <div className="divide-y divide-slate-100 bg-white">
                        {items.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className="flex items-start gap-3 p-3 active:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <div className="mt-0.5 shrink-0">
                                    <DriveIcon type={item.type} name={item.name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {/* Name */}
                                    <div className="font-medium text-slate-800 text-sm break-words line-clamp-2 mb-1">
                                        {item.name}
                                    </div>
                                    
                                    {/* Meta Info */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                        {(item.type === DriveItemType.FOLDER || item.type === "FOLDER") ? (
                                            <span className="bg-slate-100 px-1.5 rounded text-[10px] uppercase font-bold text-slate-400">Folder</span>
                                        ) : (
                                            <span className="text-[10px] uppercase font-bold text-slate-400">File</span>
                                        )}

                                        {/* Tag */}
                                        {item.tag && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 border border-slate-200 truncate max-w-[100px]">
                                                {item.tag}
                                            </span>
                                        )}

                                        {/* Access */}
                                        {item.access && (
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[10px] border",
                                                item.access === "Private" ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-emerald-50 border-emerald-100 text-emerald-700"
                                            )}>
                                                {item.access}
                                            </span>
                                        )}
                                    </div>

                                    {/* Context Info (Search Result) */}
                                    {searchTerm && item.parentName && (
                                        <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                                            <FolderOpen className="w-3 h-3" />
                                            <span className="truncate">{item.parentName}</span>
                                        </div>
                                    )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 self-center" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState searchTerm={searchTerm} clearSearch={clearSearch} />
                )}
            </div>

            {/* --- 2. DESKTOP VIEW (TABLE) - Hiện trên PC --- */}
            <div className="hidden md:block h-full">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white sticky top-0 z-10 text-slate-500 text-xs uppercase font-medium border-b border-slate-100 shadow-sm">
                    <tr>
                        <th className="px-6 py-3 font-semibold w-[50%]">Tên</th>
                        <th className="px-6 py-3 font-semibold w-[15%]">Loại</th>
                        <th className="px-6 py-3 font-semibold w-[20%]">
                            {searchTerm ? "Vị trí thư mục" : "Tag"}
                        </th>
                        <th className="px-6 py-3 font-semibold w-[15%]">Quyền</th>
                    </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-slate-100 bg-white">
                    {loading && items.length === 0 ? (
                        Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse" /></td>
                        </tr>
                        ))
                    ) : items.length > 0 ? (
                        items.map((item) => (
                        <tr 
                            key={item.id} 
                            onClick={() => handleItemClick(item)}
                            className="group hover:bg-slate-50 cursor-pointer transition-colors duration-200"
                        >
                            <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                                <DriveIcon type={item.type} name={item.name} />
                                <div className="flex flex-col min-w-0">
                                <span className="font-medium text-slate-700 group-hover:text-[#009d98] truncate max-w-[300px] lg:max-w-[450px]" title={item.name}>
                                    {item.name}
                                </span>
                                {searchTerm && (
                                    <span className="text-[10px] text-slate-400 font-normal">Kết quả tìm kiếm</span>
                                )}
                                </div>
                            </div>
                            </td>

                            <td className="px-6 py-3 text-slate-500 text-xs">
                                {(item.type === DriveItemType.FOLDER || item.type === "FOLDER") ? "Thư mục" : "Tệp tin"}
                            </td>

                            <td className="px-6 py-3">
                            {searchTerm ? (
                                <div className="flex items-center gap-1.5 text-slate-500" title="Thư mục chứa file này">
                                    <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs truncate max-w-[150px] font-medium">
                                        {item.parentName || "Không xác định"}
                                    </span>
                                </div>
                            ) : (
                                item.tag ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
                                    {item.tag}
                                </span>
                                ) : <span className="text-slate-300 text-xs">-</span>
                            )}
                            </td>

                            <td className="px-6 py-3">
                            {item.access && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                                    item.access === "Private" ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                )}>
                                {item.access}
                                </span>
                            )}
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4}>
                                <EmptyState searchTerm={searchTerm} clearSearch={clearSearch} />
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Component Empty State tách riêng cho gọn
const EmptyState = ({ searchTerm, clearSearch }: { searchTerm: string, clearSearch: () => void }) => (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        {searchTerm ? (
        <>
            <Search className="w-10 h-10 mb-3 text-slate-300" />
            <span className="text-sm text-center px-4">
                Không tìm thấy kết quả nào cho <strong className="text-slate-600">"{searchTerm}"</strong>
            </span>
            <button onClick={clearSearch} className="mt-3 text-xs text-[#009d98] hover:underline font-medium">
                Xóa tìm kiếm
            </button>
        </>
        ) : (
        <>
            <LayoutGrid className="w-12 h-12 mb-3 text-slate-200 stroke-1" />
            <span className="text-sm">Thư mục trống</span>
        </>
        )}
    </div>
);