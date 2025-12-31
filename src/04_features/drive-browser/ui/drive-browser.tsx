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
  Home
} from "lucide-react"; 
import { useDriveBrowser } from "../model/use-drive-browser";
import { DriveItemType } from "@/entities/drive/model/types";
import { cn } from "@/shared/lib/utils"; // Giả sử bạn có util này

// --- HELPER: Render Icon chuẩn SharePoint/Office ---
const DriveIcon = ({ type, name }: { type: string; name: string }) => {
  const isFolder = type === DriveItemType.FOLDER || type === "FOLDER";
  
  if (isFolder) {
    // Icon Folder màu vàng đặc trưng
    return <Folder className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
  }

  // Detect file extension
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
    handleItemClick,
    handleBreadcrumbClick,
    refresh
  } = useDriveBrowser();

  return (
    <div className="w-full h-[600px] flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm font-sans text-sm">
      
      {/* --- HEADER: BREADCRUMB --- */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-lg">
        <div className="flex items-center flex-wrap gap-1 text-slate-600">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id || "root"}>
                {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />}
                
                <button
                  onClick={() => handleBreadcrumbClick(crumb, index)}
                  disabled={isLast}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded transition-colors",
                    isLast 
                      ? "font-semibold text-slate-900 cursor-default" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                  )}
                >
                  {index === 0 && <Home className="w-4 h-4 mr-1"/>}
                  <span className="max-w-[200px] truncate">{crumb.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <button 
          onClick={refresh} 
          disabled={loading}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          title="Làm mới"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* --- CONTENT TABLE --- */}
      <div className="flex-1 overflow-auto bg-slate-50/30">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
            <span>{error}</span>
            <button onClick={refresh} className="underline text-xs">Thử lại</button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-0 text-slate-500 text-xs uppercase font-medium border-b border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <tr>
                <th className="px-6 py-3 font-semibold w-[55%]">Tên</th>
                <th className="px-6 py-3 font-semibold w-[15%]">Loại</th>
                <th className="px-6 py-3 font-semibold w-[15%]">Tag</th>
                <th className="px-6 py-3 font-semibold w-[15%]">Quyền</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && items.length === 0 ? (
                // SKELETON LOADER
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
                        <span className="font-medium text-slate-700 group-hover:text-blue-700 truncate max-w-[350px]" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* 2. Loại */}
                    <td className="px-6 py-3 text-slate-500 text-xs">
                       {(item.type === DriveItemType.FOLDER || item.type === "FOLDER") ? "Thư mục" : "Tệp tin"}
                    </td>

                    {/* 3. Tag (Dựa theo Types bạn đưa) */}
                    <td className="px-6 py-3">
                      {item.tag ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border border-gray-200">
                          {item.tag}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
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
                      <LayoutGrid className="w-12 h-12 mb-3 text-slate-200 stroke-1" />
                      <span>Thư mục trống</span>
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