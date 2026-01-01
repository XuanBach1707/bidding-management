"use client";

import { useState, useEffect, useCallback } from "react";
import { driveApi } from "@/entities/drive/api/drive-api";
import { DriveItem, DriveItemType } from "@/entities/drive/model/types";
import { useDebounce } from "@/shared/lib/hooks/use-debounce"; // Đảm bảo đường dẫn này đúng

export interface BreadcrumbItem {
  id: string | null; // null = Root
  name: string;
}

export const useDriveBrowser = () => {
  // --- 1. STATE ĐIỀU HƯỚNG ---
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: "Tất cả dự án" }
  ]);

  // --- 2. STATE TÌM KIẾM ---
  const [searchTerm, setSearchTerm] = useState("");
  // Chờ 500ms sau khi gõ mới gọi API để tránh spam
  const debouncedSearchTerm = useDebounce(searchTerm, 500); 

  // --- 3. DATA STATE ---
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 4. LOGIC GỌI API (CORE) ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;

      // [PHÂN LUỒNG] Nếu có từ khóa -> Gọi API Search
      if (debouncedSearchTerm) {
        // Truyền currentFolderId để giới hạn phạm vi tìm kiếm (Scope)
        response = await driveApi.searchRepo(debouncedSearchTerm, currentFolderId);
      } 
      // Nếu không -> Gọi API Duyệt thư mục bình thường
      else {
        if (!currentFolderId) {
          response = await driveApi.getRootProjects();
        } else {
          response = await driveApi.getFolderDetail(currentFolderId);
        }
      }

      if (response && response.data) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (err: any) {
      console.error("Drive Error:", err);
      setError("Không thể tải dữ liệu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, debouncedSearchTerm]);

  // Trigger gọi lại khi: ID thay đổi HOẶC Từ khóa tìm kiếm thay đổi
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 5. ACTIONS ---

  const handleItemClick = (item: DriveItem) => {
    const isFolder = item.type === DriveItemType.FOLDER || item.type === "FOLDER";

    if (isFolder) {
      // Khi click vào Folder:
      // 1. Xóa từ khóa tìm kiếm (để quay về chế độ duyệt file bình thường)
      if (searchTerm) setSearchTerm("");
      
      // 2. Cập nhật ID và Breadcrumb
      setCurrentFolderId(item.id);
      setBreadcrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
    } else {
      // Khi click vào File -> Mở tab mới
      if (item.link) {
        window.open(item.link, "_blank");
      }
    }
  };

  const handleBreadcrumbClick = (item: BreadcrumbItem, index: number) => {
    // Logic: Nếu đang đứng ở đó rồi và không tìm kiếm gì cả thì thôi
    if (item.id === currentFolderId && !searchTerm) return;

    // Reset tìm kiếm khi điều hướng
    setSearchTerm("");
    
    // Quay về folder cũ
    setCurrentFolderId(item.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const clearSearch = () => setSearchTerm("");

  return {
    items,
    loading,
    error,
    breadcrumbs,
    currentFolderId,
    // Search props
    searchTerm,
    setSearchTerm,
    clearSearch,
    // Actions
    handleItemClick,
    handleBreadcrumbClick,
    refresh: fetchData
  };
};