"use client";

import { useQuery } from "@tanstack/react-query";
import { taskApi, Task } from "@/entities/task";
import { DataTable } from "@/shared/ui/data-table";
import { columns } from "@/widgets/project-task-list/ui/columns"; // Tái sử dụng columns cũ
import { Skeleton } from "@/shared/ui/skeleton";

export const MyTaskList = () => {
  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ["tasks", "me"],
    queryFn: () => taskApi.getMyTasks(),
  });

  if (isLoading) return <Skeleton className="h-[400px] w-full" />;
  if (isError) return <div className="text-red-500 p-4 border rounded">Lỗi tải nhiệm vụ cá nhân</div>;

  return (
    <DataTable 
      columns={columns} 
      data={tasks || []} 
      getSubRows={(row: Task) => row.subTasks || undefined}
    />
  );
};