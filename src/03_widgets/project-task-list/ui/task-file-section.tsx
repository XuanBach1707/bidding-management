"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, FileText, Folder, ExternalLink, 
  AlertCircle, ChevronRight, Home, ArrowLeft, RefreshCw 
} from "lucide-react";
import { driveApi, DriveItem } from "@/entities/drive";
import { cn } from "@/shared/lib/utils";

interface TaskFileSectionProps {
  rootFolderId: string | null | undefined;
  rootFolderName?: string; // Tên dự án để hiển thị ở Breadcrumb gốc
  taskName?: string; // (Optional) Nếu cần logic highlight folder, nhưng giờ ta làm explorer thuần
}

// Struct cho Breadcrumb
interface BreadcrumbItem {
  id: string;
  name: string;
}

export const TaskFileSection = ({ rootFolderId, rootFolderName = "Kho tài liệu dự án" }: TaskFileSectionProps) => {
  // State quản lý navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  
  // State dữ liệu
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Init: Khi có rootFolderId, set nó làm thư mục hiện tại
  useEffect(() => {
    if (rootFolderId) {
      setCurrentFolderId(rootFolderId);
      setBreadcrumbs([{ id: rootFolderId, name: rootFolderName }]);
    }
  }, [rootFolderId, rootFolderName]);

  // 2. Fetch Data khi currentFolderId thay đổi
  const fetchFolderContent = async () => {
    if (!currentFolderId) return;

    try {
      setLoading(true);
      setError(null);
      
      const res = await driveApi.getFolderDetail(currentFolderId);
      // API trả về data là mảng các item
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

  // --- HANDLERS ---

  // Vào folder con
  const handleEnterFolder = (folder: DriveItem) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  // Click vào breadcrumb để quay lại
  const handleBreadcrumbClick = (index: number) => {
    const target = breadcrumbs[index];
    // Cắt mảng breadcrumb từ đầu đến index + 1
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setCurrentFolderId(target.id);
  };

  // Quay lại folder cha (Nút Back)
  const handleBack = () => {
    if (breadcrumbs.length <= 1) return;
    handleBreadcrumbClick(breadcrumbs.length - 2);
  };

  // --- RENDER ---

  if (!rootFolderId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <Folder className="w-10 h-10 mb-3 opacity-30" />
        <span className="text-sm font-medium">Chưa liên kết Google Drive</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-[500px]">
      
      {/* 1. TOOLBAR & BREADCRUMBS */}
      <div className="flex items-center gap-2 p-3 border-b border-slate-100 bg-slate-50/50">
        <button 
            onClick={handleBack}
            disabled={breadcrumbs.length <= 1}
            className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>

        <div className="flex-1 flex items-center gap-1 overflow-hidden text-sm px-2">
            {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                    <div key={crumb.id} className="flex items-center whitespace-nowrap">
                        {index === 0 ? (
                            <Home className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        ) : (
                            <ChevronRight className="w-3 h-3 text-slate-300 mx-1" />
                        )}
                        <span 
                            onClick={() => !isLast && handleBreadcrumbClick(index)}
                            className={cn(
                                "max-w-[150px] truncate transition-colors",
                                isLast ? "font-bold text-slate-800 cursor-default" : "text-slate-500 hover:text-blue-600 cursor-pointer hover:underline"
                            )}
                            title={crumb.name}
                        >
                            {crumb.name}
                        </span>
                    </div>
                );
            })}
        </div>

        <button onClick={fetchFolderContent} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500" title="Làm mới">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* 2. CONTENT LIST */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-xs">Đang tải dữ liệu...</span>
            </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <span className="text-sm">{error}</span>
                <button onClick={fetchFolderContent} className="text-xs underline">Thử lại</button>
            </div>
        ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                <Folder className="w-12 h-12 mb-2" />
                <span className="text-sm">Thư mục trống</span>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-1">
                {/* 2.1 Render Folders First */}
                {items.filter(i => i.type === 'FOLDER').map((item) => (
                    <div 
                        key={item.id}
                        onClick={() => handleEnterFolder(item)}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-100"
                    >
                        <Folder className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-700">{item.name}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                    </div>
                ))}

                {/* 2.2 Render Files Next */}
                {items.filter(i => i.type !== 'FOLDER').map((item) => (
                    <a 
                        key={item.id}
                        href={item.webViewLink || item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                    >
                        <div className="relative">
                            <FileText className="w-5 h-5 text-blue-500" />
                            {/* Badge Tag nếu có */}
                            {item.tag && (
                                <span className="absolute -top-1.5 -right-2 text-[8px] bg-orange-100 text-orange-600 px-1 rounded-sm font-bold border border-orange-200">
                                    {item.tag}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-600">{item.name}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
                    </a>
                ))}
            </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 text-center">
         Hiển thị {items.length} mục trong thư mục hiện tại
      </div>
    </div>
  );
};