"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; 
import { Task } from "@/entities/task";
import { taskApi } from "@/entities/task/api/task-api"; 

import { WorkspaceLayout } from "@/widgets/workspace-board";
import { TaskList } from "@/features/task-list";
import { TaskDetailPanel } from "@/widgets/task-detail";

export const MyTasksPage = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // [SỬA LỖI NULL]: Thêm dấu ? vào searchParams?.get(...)
  const searchParams = useSearchParams();
  const taskIdParam = searchParams?.get("taskId");

  useEffect(() => {
    const autoSelect = async () => {
      // Nếu không có taskIdParam thì thôi
      if (!taskIdParam) return;

      try {
        // Gọi API lấy chi tiết task (Giờ api đã có hàm này rồi)
        const taskData = await taskApi.getDetail(Number(taskIdParam));
        
        if (taskData) {
          setSelectedTask(taskData);
        }
      } catch (error) {
        console.error("Lỗi khi mở task từ URL:", error);
      }
    };

    autoSelect();
  }, [taskIdParam]);

  return (
    <WorkspaceLayout
      sidebar={
        <TaskList 
          selectedTaskId={selectedTask?.id}
          onSelectTask={setSelectedTask} 
        />
      }
      content={
        <TaskDetailPanel task={selectedTask} />
      }
    />
  );
};