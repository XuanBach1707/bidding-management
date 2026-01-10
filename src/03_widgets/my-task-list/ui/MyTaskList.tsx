"use client";

import { useQuery } from "@tanstack/react-query";
import { taskApi, Task } from "@/entities/task";
import { DataTable } from "@/shared/ui/data-table";
import { columns } from "@/widgets/project-task-list/ui/columns"; 
import { Skeleton } from "@/shared/ui/skeleton";
import { AlertCircle, ListTodo, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";

export const MyTaskList = () => {
  const { data: tasks, isLoading, isError, refetch } = useQuery({
    queryKey: ["tasks", "me"],
    queryFn: () => taskApi.getMyTasks(),
  });

  // --- RENDER LOADING ---
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
           <Skeleton className="h-12 w-12 rounded-lg" />
           <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // --- RENDER ERROR ---
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 m-6">
         <AlertCircle className="w-12 h-12 mb-3 text-red-400 opacity-80" />
         <h3 className="text-lg font-bold text-slate-700">Không thể tải dữ liệu</h3>
         <p className="text-sm mb-4">Đã xảy ra lỗi khi tải danh sách nhiệm vụ của bạn.</p>
         <Button onClick={() => refetch()} variant="outline" className="gap-2 border-slate-300">
            <RefreshCw className="w-4 h-4" /> Thử lại
         </Button>
      </div>
    );
  }

  // --- RENDER MAIN CONTENT ---
  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            {/* Icon Block */}
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                <div className="p-2 bg-[#009d98]/10 rounded-lg">
                    <ListTodo className="w-6 h-6 text-[#009d98]" />
                </div>
            </div>
            
            <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Nhiệm vụ của tôi
                </h1>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    Danh sách các công việc được phân công trực tiếp
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
                Tổng số: <span className="text-slate-800 text-sm ml-1">{tasks?.length || 0}</span>
             </span>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
         {/* DataTable cần handle scroll bên trong */}
         <div className="flex-1 overflow-auto custom-scrollbar">
            <DataTable 
              columns={columns} 
              data={tasks || []} 
              getSubRows={(row: Task) => row.subTasks || undefined}
            />
         </div>
      </div>
    </div>
  );
};