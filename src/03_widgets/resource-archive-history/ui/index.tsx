"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  BiddingHistoryItem, 
  HistoryFilterOptions, 
  ResourceItem 
} from "@/entities/resource"; 
import { resourceApi } from "@/entities/resource";
import { ArrowLeft, Loader2, History } from "lucide-react";

import { AdvancedFilterSidebar } from "./advanced-filter-sidebar";
import { ArchiveTable } from "./archive-table";
import { HistoryFolderGrid } from "./history-folder-grid";
import { HistoryFileList } from "./history-file-list";

export const ResourceArchiveHistory = () => {
  const [viewMode, setViewMode] = useState<"LIST" | "BROWSER">("LIST");
  
  // Data States
  const [historyItems, setHistoryItems] = useState<BiddingHistoryItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<HistoryFilterOptions>({ years: [], investors: [] });
  
  // Filter States (Multi-select)
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([]);

  const [browserItems, setBrowserItems] = useState<ResourceItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowserLoading, setIsBrowserLoading] = useState(false);

  // 1. Khởi tạo dữ liệu
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        // Không cần gọi getHistoryYears() nữa vì đã có folderId trong từng item
        const [historyRes, optionsRes] = await Promise.all([
          resourceApi.getBiddingHistory(),
          resourceApi.getHistoryFilters()
        ]);
        
        setHistoryItems(historyRes.items || []);
        setFilterOptions(optionsRes || { years: [], investors: [] });
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // 2. Logic Lọc
  const filteredProjects = useMemo(() => {
    return historyItems.filter(item => {
      const matchYear = selectedYears.length === 0 || selectedYears.includes(item.nam);
      const matchInvestor = selectedInvestors.length === 0 || selectedInvestors.includes(item.chuDauTu);
      return matchYear && matchInvestor;
    });
  }, [historyItems, selectedYears, selectedInvestors]);

  // 3. Fetch nội dung Browser
  useEffect(() => {
    if (viewMode === "BROWSER" && currentFolderId) {
      const fetchBrowser = async () => {
        setIsBrowserLoading(true);
        try {
          const res: any = await resourceApi.getFolderContent(currentFolderId);
          setBrowserItems(res.data || []);
        } catch (error) {
          console.error("Lỗi tải folder:", error);
          setBrowserItems([]);
        } finally {
          setIsBrowserLoading(false);
        }
      };
      fetchBrowser();
    }
  }, [viewMode, currentFolderId]);

  // --- HANDLERS ---
  
  // [CẬP NHẬT] Dùng folderId trực tiếp
  const handleOpenProject = (project: BiddingHistoryItem) => {
    setProjectName(project.tenDuAn);

    // Kiểm tra folderId (được convert từ folder_id)
    if (project.folderId) {
      setCurrentFolderId(project.folderId);
      setViewMode("BROWSER");
    } else {
      // Xử lý khi dữ liệu bị thiếu ID
      alert("Dự án này chưa được liên kết thư mục lưu trữ!");
      console.warn("Dự án thiếu folderId:", project);
    }
  };

  const resetFilters = () => {
    setSelectedYears([]);      
    setSelectedInvestors([]);  
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      {viewMode === "LIST" ? (
        <>
          <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-2 bg-blue-50 rounded-lg"><History className="w-6 h-6 text-blue-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Lịch sử năng lực Dự án</h2>
              <p className="text-sm text-slate-500">Dữ liệu hồ sơ thầu và kết quả thực hiện dự án</p>
            </div>
          </div>
          
          <div className="flex gap-6">
            <aside className="w-72 shrink-0 hidden xl:block">
              <AdvancedFilterSidebar 
                options={filterOptions}
                selectedYears={selectedYears}
                selectedInvestors={selectedInvestors}
                onYearChange={setSelectedYears}
                onInvestorChange={setSelectedInvestors}
                onReset={resetFilters}
              />
            </aside>
            <div className="flex-1">
              <ArchiveTable 
                projects={filteredProjects} 
                isLoading={isLoading} 
                onOpenProject={handleOpenProject} 
              />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <button 
              onClick={() => {
                setViewMode("LIST");
                setCurrentFolderId(null);
              }} 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1" />
            <h3 className="font-bold text-slate-800 text-lg line-clamp-1" title={projectName}>
              {projectName}
            </h3>
          </div>

          {isBrowserLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <HistoryFolderGrid 
                items={browserItems.filter(i => i.type === "FOLDER")} 
                onFolderClick={(f) => setCurrentFolderId(f.id)} 
              />
              <HistoryFileList 
                items={browserItems.filter(i => i.type !== "FOLDER")} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};