"use client";

import { useState, useEffect, useCallback } from "react";
import { driveApi } from "@/entities/drive/api/drive-api";
import { DriveItem, DriveItemType } from "@/entities/drive/model/types";
import { useDebounce } from "@/shared/lib/hooks/use-debounce";

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

// ID cố định dùng cho mọi lệnh tìm kiếm
const FIXED_SEARCH_SCOPE_ID = "1mnemuaGkv16h5jVf-ptBorudAltlxJ8p";

export const useDriveBrowser = () => {
  // --- 1. STATE ---
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: "Tất cả dự án" }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 2. LOGIC GỌI API ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;

      // [PHÂN LUỒNG]
      if (debouncedSearchTerm) {
        // === SỬA TẠI ĐÂY ===
        // Không quan tâm currentFolderId đang là gì nữa.
        // Luôn luôn dùng FIXED_SEARCH_SCOPE_ID cho hàm search.
        response = await driveApi.searchRepo(debouncedSearchTerm, FIXED_SEARCH_SCOPE_ID);
      } 
      else {
        // Logic duyệt thư mục vẫn giữ nguyên để điều hướng bình thường
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 3. ACTIONS ---
  const handleItemClick = (item: DriveItem) => {
    const isFolder = item.type === DriveItemType.FOLDER || item.type === "FOLDER";

    if (isFolder) {
      if (searchTerm) setSearchTerm("");
      setCurrentFolderId(item.id);
      setBreadcrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
    } else {
      if (item.link) {
        window.open(item.link, "_blank");
      }
    }
  };

  const handleBreadcrumbClick = (item: BreadcrumbItem, index: number) => {
    if (item.id === currentFolderId && !searchTerm) return;
    setSearchTerm("");
    setCurrentFolderId(item.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const clearSearch = () => setSearchTerm("");

  return {
    items, loading, error, breadcrumbs, currentFolderId,
    searchTerm, setSearchTerm, clearSearch,
    handleItemClick, handleBreadcrumbClick, refresh: fetchData
  };
};