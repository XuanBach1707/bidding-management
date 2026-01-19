"use client";
import { useState } from "react";
import { Task } from "@/entities/task";
import { TaskAllocationSidebar } from "@/widgets/task-allocation-sidebar";
import { TaskAllocationBoard } from "@/widgets/task-allocation-board";
import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react"; // Import icon quay lại

export const TaskAllocationPage = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Hàm quay lại danh sách (cho mobile)
  const handleBackToSidebar = () => {
    setSelectedTask(null);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden animate-in fade-in duration-300 relative">
      
      {/* 1. LOGIC SIDEBAR:
         - Mobile: Ẩn đi nếu đã chọn Task (hidden class).
         - Desktop (md:flex): Luôn hiện.
         - Width: Cần đảm bảo Sidebar có w-full trên mobile.
      */}
      <div className={`
        h-full flex-col border-r border-slate-200 bg-white z-10
        ${selectedTask ? "hidden md:flex" : "flex w-full md:w-[350px] shrink-0"} 
        transition-all duration-300
      `}>
         <TaskAllocationSidebar
           currentTaskId={selectedTask?.id || null}
           onSelectTask={setSelectedTask}
           refreshKey={refreshKey}
         />
      </div>

      {/* 2. LOGIC BOARD (MAIN CONTENT):
         - Mobile: Ẩn đi nếu CHƯA chọn Task.
         - Desktop: Luôn hiện (flex-1).
      */}
      <div className={`
        flex-col h-full overflow-hidden flex-1
        ${selectedTask ? "flex fixed inset-0 z-20 bg-slate-50 md:static md:bg-transparent" : "hidden md:flex"}
      `}>
        
        {/* HEADER RIÊNG CHO MOBILE KHI VÀO BOARD */}
        {/* Nút Back để quay lại Sidebar */}
        {selectedTask && (
            <div className="md:hidden flex items-center p-2 bg-white border-b border-slate-200 shrink-0 gap-2">
                <Button variant="ghost" size="sm" onClick={handleBackToSidebar}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
                </Button>
                <span className="font-semibold text-sm truncate flex-1">
                    {selectedTask.projectName}
                </span>
            </div>
        )}

        <TaskAllocationBoard 
          parentTask={selectedTask}
          onRefresh={handleRefresh}
        />
      </div>

    </div>
  );
};