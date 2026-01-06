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
import { Loader2 } from "lucide-react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const ResourceFileBrowser = () => {
  // --- STATE ---
  const [currentFolderId, setCurrentFolderId] = useState(RESOURCE_REPO_ROOT_ID);
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: RESOURCE_REPO_ROOT_ID, name: "Thư mục gốc" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  // --- LOGIC GỌI API ---
  useEffect(() => {
    const fetchData = async () => {
      // 1. Nếu searchQuery rỗng -> LUÔN LUÔN load folder content, không quan tâm debounce
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

      // 2. Nếu có searchQuery nhưng chưa khớp với debouncedSearch -> Đợi tiếp (không bắn request)
      if (searchQuery !== debouncedSearch) {
        return;
      }

      // 3. Nếu debouncedSearch đã khớp với searchQuery và không rỗng -> Gọi API Search
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
    // Lắng nghe 3 thứ: ID folder, giá trị đã debounce, và giá trị thực tế của ô search
  }, [currentFolderId, debouncedSearch, searchQuery]);

  // --- HANDLERS ---
  
  const handleFolderClick = (folder: ResourceItem) => {
    // [QUAN TRỌNG]: Reset search trước để effect nhận biết ngay lập tức là searchQuery rỗng
    setSearchQuery(""); 
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setSearchQuery(""); // Reset search
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

      <div className="flex-1 bg-slate-50 rounded-lg p-2 md:p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
            <span className="text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            {/* Chỉ hiện thông báo kết quả khi có searchQuery thực tế */}
            {searchQuery && debouncedSearch === searchQuery && (
              <div className="mb-4 text-sm text-slate-500 italic px-4">
                Tìm thấy {items.length} kết quả cho từ khóa "{debouncedSearch}"
              </div>
            )}

            <FolderGrid items={folders} onFolderClick={handleFolderClick} />
            <FileList items={files} />
          </>
        )}
      </div>
    </div>
  );
};