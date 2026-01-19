// task-file-section.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, FileText, Folder, ExternalLink, 
  AlertCircle, ChevronRight, Home, ArrowLeft, RefreshCw, FolderOpen
} from "lucide-react";
import { driveApi, DriveItem } from "@/entities/drive";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button"; // Đảm bảo import Button

interface TaskFileSectionProps {
  rootFolderId: string | null | undefined;
  rootFolderName?: string; 
  taskName?: string; 
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

export const TaskFileSection = ({ rootFolderId, rootFolderName = "Kho tài liệu dự án" }: TaskFileSectionProps) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rootFolderId) {
      setCurrentFolderId(rootFolderId);
      setBreadcrumbs([{ id: rootFolderId, name: rootFolderName }]);
    }
  }, [rootFolderId, rootFolderName]);

  const fetchFolderContent = async () => {
    if (!currentFolderId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await driveApi.getFolderDetail(currentFolderId);
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching folder:", err);
      setError("Không thể tải nội dung thư mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderContent();
  }, [currentFolderId]);

  const handleEnterFolder = (folder: DriveItem) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = breadcrumbs[index];
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setCurrentFolderId(target.id);
  };

  const handleBack = () => {
    if (breadcrumbs.length <= 1) return;
    handleBreadcrumbClick(breadcrumbs.length - 2);
  };

  if (!rootFolderId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 h-full">
        <FolderOpen className="w-12 h-12 mb-3 opacity-20" />
        <span className="text-sm font-bold text-slate-500">Chưa liên kết kho tài liệu</span>
      </div>
    );
  }

  return (
    // [UPDATE] h-full để fill height của TabsContent bên ngoài
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full min-h-[400px] overflow-hidden">
      
      {/* 1. TOOLBAR & BREADCRUMBS */}
      <div className="flex flex-col gap-2 p-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-2">
            <button 
                onClick={handleBack}
                disabled={breadcrumbs.length <= 1}
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all border border-transparent hover:border-slate-200"
            >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div className="flex-1"></div>
            <button onClick={fetchFolderContent} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-slate-500 transition-all border border-transparent hover:border-slate-200" title="Làm mới">
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-[#009d98]")} />
            </button>
        </div>

        {/* [UPDATE] Horizontal Scroll Breadcrumbs */}
        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm px-1 pb-1 no-scrollbar">
            {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                    <div key={crumb.id} className="flex items-center shrink-0">
                        {index === 0 ? (
                            <Home className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        ) : (
                            <ChevronRight className="w-3 h-3 text-slate-300 mx-1" />
                        )}
                        <span 
                            onClick={() => !isLast && handleBreadcrumbClick(index)}
                            className={cn(
                                "max-w-[150px] truncate transition-colors text-xs",
                                isLast 
                                    ? "font-bold text-slate-800 cursor-default bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm" 
                                    : "text-slate-500 hover:text-[#009d98] cursor-pointer hover:underline font-medium"
                            )}
                            title={crumb.name}
                        >
                            {crumb.name}
                        </span>
                    </div>
                );
            })}
        </div>
      </div>

      {/* 2. CONTENT LIST */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-slate-50/30">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#009d98]" />
                <span className="text-xs font-bold text-slate-500">Đang tải dữ liệu...</span>
            </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <span className="text-sm font-medium">{error}</span>
                <button onClick={fetchFolderContent} className="text-xs underline hover:text-red-700">Thử lại</button>
            </div>
        ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                <FolderOpen className="w-12 h-12 mb-2 text-slate-300" />
                <span className="text-sm font-medium">Thư mục trống</span>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-2">
                {/* Folders */}
                {items.filter(i => i.type === 'FOLDER').map((item) => (
                    <div 
                        key={item.id}
                        onClick={() => handleEnterFolder(item)}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-all border border-transparent hover:border-slate-200 hover:shadow-sm active:bg-white"
                    >
                        <Folder className="w-5 h-5 text-slate-400 fill-slate-100 group-hover:text-[#009d98] group-hover:fill-[#009d98]/10 transition-colors shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate group-hover:text-[#009d98]">{item.name}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#009d98] shrink-0" />
                    </div>
                ))}

                {/* Files */}
                {items.filter(i => i.type !== 'FOLDER').map((item) => (
                    <a 
                        key={item.id}
                        href={item.webViewLink || item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-all border border-transparent hover:border-slate-200 hover:shadow-sm active:bg-white"
                    >
                        <div className="relative shrink-0">
                            <FileText className="w-5 h-5 text-slate-500 group-hover:text-[#009d98]" />
                            {item.tag && (
                                <span className="absolute -top-1.5 -right-2 text-[8px] bg-[#009d98]/10 text-[#009d98] px-1 rounded-sm font-bold border border-[#009d98]/20">
                                    {item.tag}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate group-hover:text-[#009d98]">{item.name}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                    </a>
                ))}
            </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 text-center font-medium shrink-0">
          Hiển thị {items.length} mục
      </div>
    </div>
  );
};