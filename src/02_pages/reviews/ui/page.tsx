"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; 
import { Task, taskApi } from "@/entities/task";

import { WorkspaceLayout } from "@/widgets/workspace-board";
import { ReviewTaskList } from "@/features/task-list/ui/review-task-list"; // [MỚI] Import List Review
import { TaskDetailPanel } from "@/widgets/task-detail"; // Widget cũ
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const ReviewsPage = () => {
  // State lưu dữ liệu chi tiết
  const [selectedTaskFull, setSelectedTaskFull] = useState<Task | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);

  const searchParams = useSearchParams();
  const taskIdParam = searchParams?.get("taskId");
  const { toast } = useToast();

  // --- 1. Gọi API Detail dành riêng cho Reviewer ---
  // (Endpoint: GET /users/reviewer/{id})
  const fetchReviewerDetail = async (id: number) => {
    try {
      setIsLoadingDetail(true);
      setSelectedTaskId(id);

      // Gọi API đặc thù của Reviewer
      const fullData = await taskApi.getReviewerDetail(id);
      setSelectedTaskFull(fullData);

    } catch (error) {
      console.error("Lỗi tải chi tiết review:", error);
      toast({ variant: "destructive", description: "Không thể tải chi tiết hồ sơ duyệt" });
      setSelectedTaskFull(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // --- 2. Hàm Refresh (Dùng để reload sau khi Duyệt/Từ chối) ---
  const handleRefresh = () => {
    if (selectedTaskId) {
        fetchReviewerDetail(selectedTaskId);
    }
    // Lưu ý: Nếu muốn list bên trái cũng reload (để mất task đã duyệt đi), 
    // ta cần một cơ chế trigger reload cho ReviewTaskList, nhưng tạm thời reload detail là đủ để thấy status thay đổi.
  };

  // --- 3. Auto Load từ URL ---
  useEffect(() => {
    if (taskIdParam) {
      const id = Number(taskIdParam);
      if (!isNaN(id)) {
        fetchReviewerDetail(id);
      }
    }
  }, [taskIdParam]);

  // --- 4. Handler Click vào List ---
  const handleSelectTask = (taskBasic: Task) => {
    if (taskBasic.id === selectedTaskId) return;
    fetchReviewerDetail(taskBasic.id);
  };

  return (
    <WorkspaceLayout
      // SIDEBAR: Dùng ReviewTaskList
      sidebar={
        <ReviewTaskList 
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask} 
        />
      }
      
      // CONTENT: Dùng TaskDetailPanel nhưng bật ReviewMode
      content={
        isLoadingDetail ? (
           <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-3" />
              <p className="text-sm font-medium">Đang tải hồ sơ duyệt...</p>
           </div>
        ) : (
           <TaskDetailPanel 
              task={selectedTaskFull} 
              onRefresh={handleRefresh} 
              // [QUAN TRỌNG]: Kích hoạt giao diện Duyệt/Từ chối
              isReviewMode={true} 
           />
        )
      }
    />
  );
};

export default ReviewsPage;