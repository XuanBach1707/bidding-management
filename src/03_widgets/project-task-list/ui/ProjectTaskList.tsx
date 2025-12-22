"use client";

import { useQuery } from "@tanstack/react-query";
import { taskApi, Task } from "@/entities/task"; // Thêm Task vào để định nghĩa kiểu
import { DataTable } from "@/shared/ui/data-table";
import { Skeleton } from "@/shared/ui/skeleton";
import { columns } from "./columns";

interface ProjectTaskListProps {
  projectId: number;
}

export const ProjectTaskList = ({ projectId }: ProjectTaskListProps) => {
  // 1. Gọi API lấy danh sách
  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskApi.getList(projectId),
    enabled: !!projectId, 
  });

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // 3. Error State
  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Lỗi: Không thể tải danh sách công việc cho dự án này.
      </div>
    );
  }

  // 4. Render Bảng
  return (
    <div className="space-y-4">
      <DataTable 
        columns={columns} 
        data={tasks || []} 
        // Ép kiểu (row: Task) và dùng || undefined để khớp 100% với Interface của DataTable
        getSubRows={(row: Task) => row.subTasks || undefined}
      />
    </div>
  );
};