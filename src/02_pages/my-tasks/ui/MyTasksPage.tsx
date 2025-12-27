"use client"; // <--- BẮT BUỘC PHẢI CÓ DÒNG NÀY Ở ĐẦU FILE

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskApi } from "@/05_entities/task/api/task-api"; 
import { Skeleton } from "@/06_shared/ui/skeleton";

// Import components
import { TaskSidebar } from "./task-sidebar";
import { TaskDetailView } from "./TaskDetailView"; // Import component mới tạo ở trên

export const MyTasksPage = () => {
  // State quản lý task đang được chọn
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Lấy danh sách task của tôi
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", "me"],
    queryFn: () => taskApi.getMyTasks(),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen p-4 gap-4">
        <div className="w-[300px] flex flex-col gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white border-t"> 
      {/* 1. Sidebar bên trái: Danh sách công việc */}
      <div className="w-[350px] border-r flex-shrink-0 bg-slate-50/30">
        <TaskSidebar 
          tasks={tasks || []} // Đảm bảo tasks là mảng
          selectedTaskId={selectedTaskId}
          onSelectTask={(task) => setSelectedTaskId(task.id)} // Giả sử sidebar trả về object task, ta chỉ lấy ID
        />
      </div>
      
      {/* 2. Content bên phải: Chi tiết công việc (3 Tabs) */}
      <div className="flex-1 flex flex-col min-w-0">
        <TaskDetailView taskId={selectedTaskId} />
      </div>
    </div>
  );
};