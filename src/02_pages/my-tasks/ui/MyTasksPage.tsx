"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; 
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
  const taskIdParam = searchParams?.get("taskId");
  const { toast } = useToast();

  // --- HÀM GỌI API LẤY CHI TIẾT ---
  const fetchTaskDetail = async (id: number) => {
    try {
      setIsLoadingDetail(true);
      
      // Highlight ngay lập tức
      setSelectedTaskId(id);

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

  // --- [MỚI] HÀM REFRESH (Dùng để truyền xuống con) ---
  const handleRefresh = () => {
    // Nếu đang chọn task nào thì load lại task đó
    if (selectedTaskId) {
        fetchTaskDetail(selectedTaskId);
    }
  };

  // --- AUTO LOAD TỪ URL ---
  useEffect(() => {
    if (taskIdParam) {
      const id = Number(taskIdParam);
      if (!isNaN(id)) {
        fetchTaskDetail(id);
      }
    }
  }, [taskIdParam]);

  // --- HANDLER KHI CLICK LIST ---
  const handleSelectTask = (taskBasic: Task) => {
    if (taskBasic.id === selectedTaskId) return;
    fetchTaskDetail(taskBasic.id);
  };

  return (
    <WorkspaceLayout
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
           <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
              <p className="text-sm font-medium">Đang tải thông tin chi tiết...</p>
           </div>
        ) : (
           <TaskDetailPanel 
              task={selectedTaskFull} 
              onRefresh={handleRefresh} // <--- [FIX LỖI] Đã truyền prop onRefresh
           />
        )
      }
    />
  );
};