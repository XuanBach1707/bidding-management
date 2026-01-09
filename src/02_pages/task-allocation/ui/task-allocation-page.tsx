"use client";
import { useState } from "react";
import { Task } from "@/entities/task";
import { TaskAllocationSidebar } from "@/widgets/task-allocation-sidebar";
import { TaskAllocationBoard } from "@/widgets/task-allocation-board";

export const TaskAllocationPage = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Hàm này được gọi khi tạo subtask thành công bên Board
  const handleRefresh = () => {
    // Tăng refreshKey để trigger useEffect bên trong Sidebar -> Fetch lại dữ liệu mới nhất
    setRefreshKey((prev) => prev + 1);
  };

  return (
    // [UPDATE] Design System: Sử dụng bg-slate-50 thay cho gray-100
    // Thêm animation fade-in nhẹ
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden animate-in fade-in duration-300">
      {/* SIDEBAR TRÁI */}
      <TaskAllocationSidebar
        currentTaskId={selectedTask?.id || null}
        onSelectTask={setSelectedTask}
        refreshKey={refreshKey}
      />

      {/* BOARD PHẢI */}
      {/* Component này đã được set flex-1 bên trong nên sẽ tự chiếm không gian còn lại */}
      <TaskAllocationBoard 
        parentTask={selectedTask}
        onRefresh={handleRefresh}
      />
    </div>
  );
};