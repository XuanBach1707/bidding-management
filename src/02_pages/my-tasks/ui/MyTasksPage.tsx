"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation"; // Thêm useRouter, usePathname
import { Task, taskApi } from "@/entities/task";

import { WorkspaceLayout } from "@/widgets/workspace-board";
import { TaskList } from "@/features/task-list";
import { TaskDetailPanel } from "@/widgets/task-detail";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const MyTasksPage = () => {
  // 1. State lưu dữ liệu chi tiết
  const [selectedTaskFull, setSelectedTaskFull] = useState<Task | null>(null);
  
  // 2. State loading
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  
  // 3. State lưu ID để highlight
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);

  const searchParams = useSearchParams();
  const router = useRouter(); // [MỚI] Để điều hướng URL
  const pathname = usePathname(); // [MỚI] Lấy đường dẫn hiện tại
  
  const taskIdParam = searchParams?.get("taskId");
  const { toast } = useToast();

  // --- HÀM GỌI API LẤY CHI TIẾT ---
  const fetchTaskDetail = async (id: number) => {
    try {
      setIsLoadingDetail(true);
      
      // Highlight ngay lập tức
      setSelectedTaskId(id);

      // [UX Mobile] Scroll lên đầu trang khi mở task mới
      // Để tránh trường hợp đang scroll tít dưới list, bấm vào task lại thấy màn hình trống
      if (typeof window !== "undefined") {
         window.scrollTo({ top: 0, behavior: "smooth" });
      }

      // Gọi API lấy dữ liệu đầy đủ
      const fullData = await taskApi.getDetail(id);
      setSelectedTaskFull(fullData);

    } catch (error) {
      console.error("Lỗi tải chi tiết task:", error);
      toast({ variant: "destructive", description: "Không thể tải nội dung công việc" });
      setSelectedTaskFull(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // --- HÀM REFRESH (Dùng để truyền xuống con) ---
  const handleRefresh = () => {
    if (selectedTaskId) {
        fetchTaskDetail(selectedTaskId);
    }
  };


// --- [MỚI] HÀM QUAY LẠI DANH SÁCH (Dành cho Mobile) ---
  const handleBackToList = () => {
    setSelectedTaskId(undefined);
    setSelectedTaskFull(null);
    
    // FIX LỖI: Kiểm tra pathname tồn tại trước khi dùng
    if (pathname) {
        router.replace(pathname);
    }
  }

  // --- AUTO LOAD TỪ URL ---
  useEffect(() => {
    if (taskIdParam) {
      const id = Number(taskIdParam);
      if (!isNaN(id)) {
        // Nếu ID khác với cái đang chọn thì mới fetch
        if (id !== selectedTaskId) {
            fetchTaskDetail(id);
        }
      }
    } else {
        // Trường hợp người dùng bấm Back của trình duyệt để về trang list
        // Ta cần reset state để hiển thị lại List trên mobile
        setSelectedTaskId(undefined);
        setSelectedTaskFull(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIdParam]);

  // --- HANDLER KHI CLICK LIST ---
  const handleSelectTask = (taskBasic: Task) => {
    if (taskBasic.id === selectedTaskId) return;

    // [MỚI] Cập nhật URL nhưng không reload trang
    // Giúp user có thể refresh trang mà vẫn ở đúng task đó
    const params = new URLSearchParams(searchParams?.toString());
    params.set("taskId", taskBasic.id.toString());
    router.push(`${pathname}?${params.toString()}`);

    // Gọi hàm fetch
    fetchTaskDetail(taskBasic.id);
  };

  return (
    <WorkspaceLayout
      // [LOGIC CỐT LÕI] Điều khiển hiển thị Mobile
      // Nếu chưa chọn Task (undefined) -> showSidebarOnMobile = true (Hiện List)
      // Nếu đã chọn Task -> showSidebarOnMobile = false (Hiện Content)
      showSidebarOnMobile={!selectedTaskId}

      // SIDEBAR
      sidebar={
        <TaskList 
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask} 
        />
      }
      
      // CONTENT
      content={
        isLoadingDetail ? (
           // Thêm min-h để loading nằm giữa màn hình đẹp hơn
           <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
              <p className="text-sm font-medium">Đang tải thông tin chi tiết...</p>
           </div>
        ) : (
           <TaskDetailPanel 
              task={selectedTaskFull} 
              onRefresh={handleRefresh}
              // [MỚI] Truyền hàm Back xuống để component con hiển thị nút Back trên mobile
              onBack={handleBackToList} 
           />
        )
      }
    />
  );
};