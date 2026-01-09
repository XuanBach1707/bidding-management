"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  resourceApi, 
  RESOURCE_REPO_ROOT_ID, 
  ResourceItem 
} from "@/entities/resource";
import { BrowserHeader, BreadcrumbItem } from "./browser-header";
import { FolderGrid } from "./folder-grid";
import { FileList } from "./file-list";
import { Loader2, SearchX } from "lucide-react";

// Hook Debounce giữ nguyên
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const ResourceFileBrowser = () => {
  // State
  const [currentFolderId, setCurrentFolderId] = useState(RESOURCE_REPO_ROOT_ID);
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: RESOURCE_REPO_ROOT_ID, name: "Thư mục gốc" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Logic API
  useEffect(() => {
    const fetchData = async () => {
      // Case 1: Load Folder
      if (!searchQuery) {
        setIsLoading(true);
        try {
          const response = await resourceApi.getFolderContent(currentFolderId);
          setItems(response.data || []);
        } catch (error) {
          console.error("Lỗi tải dữ liệu kho:", error);
          setItems([]);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Case 2: Waiting Debounce
      if (searchQuery !== debouncedSearch) return;

      // Case 3: Search API
      setIsLoading(true);
      try {
        const results = await resourceApi.searchResources(debouncedSearch, RESOURCE_REPO_ROOT_ID);
        setItems(results);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFolderId, debouncedSearch, searchQuery]);

  // Handlers
  const handleFolderClick = (folder: ResourceItem) => {
    setSearchQuery(""); 
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setSearchQuery(""); 
    const targetCrumb = breadcrumbs[index];
    setCurrentFolderId(targetCrumb.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const folders = useMemo(() => items.filter(i => i.type === "FOLDER"), [items]);
  const files = useMemo(() => items.filter(i => i.type !== "FOLDER"), [items]);

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      <BrowserHeader 
        breadcrumbs={breadcrumbs} 
        onBreadcrumbClick={handleBreadcrumbClick}
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />

      <div className="flex-1 bg-slate-50/50 rounded-xl p-1 md:p-0 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#009d98]" />
            <span className="text-sm font-medium animate-pulse">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            {/* Search Result Feedback */}
            {searchQuery && debouncedSearch === searchQuery && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-sm flex items-center gap-2">
                 <span className="font-semibold">Kết quả tìm kiếm:</span> 
                 <span>Tìm thấy <b>{items.length}</b> tài liệu cho từ khóa "{debouncedSearch}"</span>
              </div>
            )}

            {/* Empty State */}
            {items.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                    <div className="p-4 bg-slate-100 rounded-full mb-3">
                        <SearchX className="w-8 h-8 text-slate-300" />
                    </div>
                    <p>Không tìm thấy dữ liệu nào.</p>
                </div>
            )}

            {/* Content */}
            <div className="space-y-2">
                <FolderGrid items={folders} onFolderClick={handleFolderClick} />
                <FileList items={files} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};