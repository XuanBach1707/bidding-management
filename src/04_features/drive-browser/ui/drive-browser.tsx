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
  FolderOpen // [MỚI] Icon cho thư mục cha
} from "lucide-react"; 
import { useDriveBrowser } from "../model/use-drive-browser";
import { DriveItemType } from "@/entities/drive/model/types";
import { cn } from "@/shared/lib/utils"; 

// --- HELPER: Render Icon ---
const DriveIcon = ({ type, name }: { type: string; name: string }) => {
  const isFolder = type === DriveItemType.FOLDER || type === "FOLDER";
  
  if (isFolder) {
    return <Folder className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
  }

  const ext = name.split(".").pop()?.toLowerCase();
  
  if (["doc", "docx"].includes(ext || "")) return <FileText className="w-5 h-5 text-blue-600" />;
  if (["xls", "xlsx", "csv"].includes(ext || "")) return <FileText className="w-5 h-5 text-green-600" />;
  if (["pdf"].includes(ext || "")) return <FileText className="w-5 h-5 text-red-600" />;
  if (["png", "jpg", "jpeg"].includes(ext || "")) return <FileImage className="w-5 h-5 text-purple-600" />;
  
  return <File className="w-5 h-5 text-gray-400" />;
};

export const DriveBrowser = () => {
  const {
    items,
    loading,
    error,
    breadcrumbs,
    // Props cũ
    handleItemClick,
    handleBreadcrumbClick,
    refresh,
    // Props cho Search
    searchTerm,
    setSearchTerm,
    clearSearch
  } = useDriveBrowser();

  return (
    <div className="w-full h-[600px] flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm font-sans text-sm">
      
      {/* --- HEADER --- */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-lg gap-4">
        
        {/* 1. Breadcrumbs (Bên trái) */}
        <div className="flex items-center flex-wrap gap-1 text-slate-600 flex-1 overflow-hidden">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id || "root"}>
                {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0" />}
                
                <button
                  onClick={() => handleBreadcrumbClick(crumb, index)}
                  // Nếu đang search thì cho phép click breadcrumb cuối để reset search
                  disabled={isLast && !searchTerm} 
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded transition-colors truncate max-w-[150px]",
                    (isLast && !searchTerm)
                      ? "font-semibold text-slate-900 cursor-default" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                  )}
                  title={crumb.name}
                >
                  {index === 0 && <Home className="w-4 h-4 mr-1"/>}
                  <span className="truncate">{crumb.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* 2. Search & Refresh (Bên phải) */}
        <div className="flex items-center gap-3">
          {/* SEARCH INPUT */}
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Tìm trong thư mục này..." 
              className="w-64 pl-9 pr-8 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
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

          <div className="h-5 w-[1px] bg-slate-200"></div>

          <button 
            onClick={refresh} 
            disabled={loading}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            title="Làm mới"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* --- CONTENT TABLE --- */}
      <div className="flex-1 overflow-auto bg-slate-50/30">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
            <span>{error}</span>
            <button onClick={refresh} className="underline text-xs hover:text-red-700">Thử lại</button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-0 text-slate-500 text-xs uppercase font-medium border-b border-slate-100 shadow-sm">
              <tr>
                <th className="px-6 py-3 font-semibold w-[55%]">Tên</th>
                <th className="px-6 py-3 font-semibold w-[15%]">Loại</th>
                
                {/* [CẬP NHẬT] Header thay đổi động: Tag <-> Vị trí */}
                <th className="px-6 py-3 font-semibold w-[20%]">
                    {searchTerm ? "Vị trí thư mục" : "Tag"}
                </th>

                <th className="px-6 py-3 font-semibold w-[10%]">Quyền</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && items.length === 0 ? (
                // SKELETON LOADING
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
                    className="group hover:bg-blue-50/50 cursor-pointer transition-colors duration-200"
                  >
                    {/* 1. Tên + Icon */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <DriveIcon type={item.type} name={item.name} />
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-slate-700 group-hover:text-blue-700 truncate max-w-[350px]" title={item.name}>
                            {item.name}
                          </span>
                          {/* Hint nhỏ khi đang search */}
                          {searchTerm && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              Kết quả tìm kiếm
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Loại */}
                    <td className="px-6 py-3 text-slate-500 text-xs">
                       {(item.type === DriveItemType.FOLDER || item.type === "FOLDER") ? "Thư mục" : "Tệp tin"}
                    </td>

                    {/* 3. [CẬP NHẬT] Vị trí (Khi Search) hoặc Tag (Khi Browse) */}
                    <td className="px-6 py-3">
                      {searchTerm ? (
                        // CASE SEARCH: Hiển thị tên thư mục cha
                        <div className="flex items-center gap-1.5 text-slate-500" title="Thư mục chứa file này">
                            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs truncate max-w-[150px] font-medium">
                                {item.parentName || "Không xác định"}
                            </span>
                        </div>
                      ) : (
                        // CASE NORMAL: Hiển thị Tag
                        item.tag ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border border-gray-200">
                            {item.tag}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )
                      )}
                    </td>

                    {/* 4. Access */}
                    <td className="px-6 py-3">
                      {item.access && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {item.access}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                // EMPTY STATE
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      {searchTerm ? (
                        <>
                           <Search className="w-10 h-10 mb-3 text-slate-300" />
                           <span>Không tìm thấy kết quả nào cho <strong className="text-slate-600">"{searchTerm}"</strong></span>
                           <button onClick={clearSearch} className="mt-2 text-xs text-blue-600 hover:underline">Xóa tìm kiếm</button>
                        </>
                      ) : (
                        <>
                          <LayoutGrid className="w-12 h-12 mb-3 text-slate-200 stroke-1" />
                          <span>Thư mục trống</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};