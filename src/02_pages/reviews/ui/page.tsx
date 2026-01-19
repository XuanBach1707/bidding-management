"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation"; 
import { Task, taskApi } from "@/entities/task";
import { WorkspaceLayout } from "@/widgets/workspace-board";
import { ReviewTaskList } from "@/features/task-list/ui/review-task-list"; 
import { TaskDetailPanel } from "@/widgets/task-detail"; 
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";

export const ReviewsPage = () => {
  const [selectedTaskFull, setSelectedTaskFull] = useState<Task | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const taskIdParam = searchParams?.get("taskId");
  const { toast } = useToast();

  // --- LOGIC FETCH DATA (Giữ nguyên) ---
  const fetchReviewerDetail = async (id: number) => {
    try {
      setIsLoadingDetail(true);
      setSelectedTaskId(id);
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

  const handleRefresh = () => {
    if (selectedTaskId) fetchReviewerDetail(selectedTaskId);
  };

  useEffect(() => {
    if (taskIdParam) {
      const id = Number(taskIdParam);
      if (!isNaN(id)) fetchReviewerDetail(id);
    }
  }, [taskIdParam]);

  const handleSelectTask = (taskBasic: Task) => {
    if (taskBasic.id === selectedTaskId) return;
    router.replace(`${pathname}?taskId=${taskBasic.id}`); // Update URL
    fetchReviewerDetail(taskBasic.id);
  };

  // --- LOGIC MOBILE: QUAY LẠI LIST ---
  const handleBackToList = () => {
    setSelectedTaskId(undefined);
    setSelectedTaskFull(null);
    router.replace(pathname || "/");
  };

  // Logic quyết định hiển thị trên mobile
  // Nếu chưa chọn task -> Hiện Sidebar (List)
  // Nếu đã chọn task -> Ẩn Sidebar (để hiện Content)
  const showSidebarMobile = !selectedTaskId;

  return (
    <WorkspaceLayout
      // [QUAN TRỌNG] Truyền prop này vào để Layout tự xử lý ẩn hiện
      showSidebarOnMobile={showSidebarMobile}

      sidebar={
        <ReviewTaskList 
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask} 
        />
      }
      
      content={
        <div className="flex flex-col h-full w-full">
           {/* HEADER MOBILE: Chỉ hiện khi đang xem chi tiết trên màn hình nhỏ */}
           {/* md:hidden để ẩn trên desktop */}
           {selectedTaskId && (
                <div className="md:hidden flex items-center gap-2 p-3 bg-white border-b border-slate-200 shrink-0 shadow-sm z-20">
                    <Button variant="ghost" size="icon" onClick={handleBackToList} className="h-8 w-8 -ml-1 text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <span className="font-bold text-slate-800 text-sm truncate flex-1">
                        Chi tiết hồ sơ
                    </span>
                </div>
            )}

           <div className="flex-1 overflow-hidden relative h-full">
              {isLoadingDetail ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <Loader2 className="w-8 h-8 animate-spin text-[#009d98] mb-2" />
                   <span className="text-sm">Đang tải...</span>
                </div>
              ) : !selectedTaskFull ? (
                 // Empty state trên Desktop khi chưa chọn gì
                 <div className="hidden md:flex h-full flex-col items-center justify-center text-slate-400">
                    <p>Chọn một hồ sơ để duyệt</p>
                 </div>
              ) : (
                 <TaskDetailPanel 
                    task={selectedTaskFull} 
                    onRefresh={handleRefresh} 
                    isReviewMode={true} 
                 />
              )}
           </div>
        </div>
      }
    />
  );
};

export default ReviewsPage;