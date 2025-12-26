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
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      {/* SIDEBAR TRÁI */}
      <TaskAllocationSidebar
        currentTaskId={selectedTask?.id || null}
        onSelectTask={setSelectedTask}
        refreshKey={refreshKey}
      />

      {/* BOARD PHẢI */}
      <TaskAllocationBoard 
        parentTask={selectedTask}
        onRefresh={handleRefresh}
      />
    </div>
  );
};