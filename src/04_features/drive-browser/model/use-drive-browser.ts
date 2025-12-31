import { useState, useEffect, useCallback } from "react";
// Import đúng từ file bạn đã có
import { driveApi } from "@/entities/drive/api/drive-api";
import { DriveItem, DriveItemType } from "@/entities/drive/model/types";

export interface BreadcrumbItem {
  id: string | null; // null đại diện cho Root
  name: string;
}

export const useDriveBrowser = () => {
  // 1. State điều hướng
  // null = Đang ở Root (API getRootProjects)
  // string = Đang ở Folder con (API getFolderDetail)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  // Breadcrumb: Mặc định luôn có nút "Home"
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: "Tất cả dự án" }
  ]);

  // 2. Data State
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. Hàm gọi API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      if (!currentFolderId) {
        // CASE 1: Gọi Root
        response = await driveApi.getRootProjects();
      } else {
        // CASE 2: Gọi Chi tiết Folder
        response = await driveApi.getFolderDetail(currentFolderId);
      }

      // Interceptor của bạn đã camelCase hóa dữ liệu, ta chỉ việc dùng
      if (response && response.data) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (err: any) {
      console.error("Lỗi tải dữ liệu Drive:", err);
      setError("Không thể truy cập thư mục này.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  // Gọi fetch khi ID thay đổi
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 4. Hành động User

  const handleItemClick = (item: DriveItem) => {
    // Check type: Có thể là Enum DriveItemType.FOLDER hoặc string "FOLDER"
    const isFolder = item.type === DriveItemType.FOLDER || item.type === "FOLDER";

    if (isFolder) {
      // 1. Đi vào Folder
      setCurrentFolderId(item.id);
      setBreadcrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
    } else {
      // 2. Mở File (Tab mới)
      if (item.link) {
        window.open(item.link, "_blank");
      }
    }
  };

  const handleBreadcrumbClick = (item: BreadcrumbItem, index: number) => {
    if (item.id === currentFolderId) return; // Click vào chính nó thì thôi

    // Quay xe về ID cũ
    setCurrentFolderId(item.id);
    // Cắt đuôi Breadcrumb thừa
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  return {
    items,
    loading,
    error,
    breadcrumbs,
    currentFolderId,
    handleItemClick,
    handleBreadcrumbClick,
    refresh: fetchData
  };
};