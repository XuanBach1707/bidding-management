"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  resourceApi, 
  ResourceItem,
  YearFolder 
} from "@/entities/resource";
import { ArrowLeft, Loader2, FolderOpen } from "lucide-react";

// Import các thành phần nội bộ của Widget
import { AdvancedFilterSidebar } from "./advanced-filter-sidebar";
import { ArchiveTable } from "./archive-table";
import { HistoryFolderGrid } from "./history-folder-grid";
import { HistoryFileList } from "./history-file-list";
import { YearSelector } from "./year-selector";

export const ResourceArchiveHistory = () => {
  // --- STATE QUẢN LÝ VIEW ---
  const [viewMode, setViewMode] = useState<"LIST" | "BROWSER">("LIST");
  
  // --- STATE DỮ LIỆU ---
  const [years, setYears] = useState<YearFolder[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ResourceItem[]>([]);
  
  // State cho Browser (Khi xem chi tiết dự án)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [browserItems, setBrowserItems] = useState<ResourceItem[]>([]);
  
  // State Loading
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // 1. Khởi tạo: Lấy danh sách năm
  useEffect(() => {
    const initData = async () => {
      try {
        const yearList = await resourceApi.getHistoryYears();
        setYears(yearList);
        if (yearList.length > 0) setSelectedYearId(yearList[0].id);
      } catch (error) {
        console.error("Lỗi khởi tạo lịch sử:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initData();
  }, []);

  // 2. Fetch dữ liệu: Tùy theo viewMode
  useEffect(() => {
    const fetchData = async () => {
      if (viewMode === "LIST" && selectedYearId) {
        setIsLoadingData(true);
        try {
          const res = await resourceApi.getFolderContent(selectedYearId);
          setProjects((res.data || []).filter(item => item.type === "FOLDER"));
        } finally {
          setIsLoadingData(false);
        }
      } else if (viewMode === "BROWSER" && currentFolderId) {
        setIsLoadingData(true);
        try {
          const res = await resourceApi.getFolderContent(currentFolderId);
          setBrowserItems(res.data || []);
        } finally {
          setIsLoadingData(false);
        }
      }
    };
    fetchData();
  }, [viewMode, selectedYearId, currentFolderId]);

  // --- HANDLERS ---
  const handleOpenProject = (project: ResourceItem) => {
    setProjectName(project.name);
    setCurrentFolderId(project.id);
    setViewMode("BROWSER");
  };

  const handleBackToList = () => {
    setViewMode("LIST");
    setCurrentFolderId(null);
    setBrowserItems([]);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentYearObj = years.find(y => y.id === selectedYearId);
  const currentYearLabel = currentYearObj?.year || new Date().getFullYear();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      {viewMode === "LIST" ? (
        <>
          {/* MÀN HÌNH DANH SÁCH + LỌC */}
          <YearSelector 
            years={years} 
            selectedYearId={selectedYearId} 
            onYearChange={setSelectedYearId} 
          />
          
          <div className="flex gap-6">
            <aside className="w-64 shrink-0 hidden xl:block">
              <AdvancedFilterSidebar />
            </aside>
            <div className="flex-1">
              {/* [SỬA LỖI]: Truyền đầy đủ props cho ArchiveTable */}
              <ArchiveTable 
                projects={projects} 
                isLoading={isLoadingData} 
                yearLabel={currentYearLabel}
                onOpenProject={handleOpenProject} 
              />
            </div>
          </div>
        </>
      ) : (
        /* MÀN HÌNH DUYỆT FILE DỰ ÁN */
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <button onClick={handleBackToList} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1" />
            <div>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <FolderOpen className="w-3 h-3" />
                Duyệt hồ sơ dự án
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{projectName}</h3>
            </div>
          </div>

          {isLoadingData ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <div className="space-y-8">
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