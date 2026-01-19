"use client";

import { useEffect, useState } from "react";
import { Flame, Briefcase, CalendarClock } from "lucide-react"; 
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { taskApi } from "@/entities/task/api/task-api";
import { Task } from "@/entities/task/model/types";
import { Skeleton } from "@/shared/ui/skeleton";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

export const DeadlineAlertsWidget = () => {
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrgentWork = async () => {
      try {
        setLoading(true);
        const tasks = await taskApi.getAssignedTasks();
        
        const sorted = tasks
          .filter((t) => {
            if (t.status === "COMPLETED" || !t.deadline) return false;
            return true; 
          })
          .sort((a, b) => {
             return new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();
          })
          .slice(0, 5);

        setUrgentTasks(sorted);
      } catch (error) {
        console.error("Lỗi tải deadline:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUrgentWork();
  }, []);

  if (loading) return <Skeleton className="h-[450px] md:h-[500px] w-full rounded-xl" />;

  return (
    // Mobile: h-[450px] cho gọn. PC: h-[500px]
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[450px] md:h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-red-100 bg-red-50/50 flex justify-between items-center shrink-0">
        <h3 className="font-bold text-red-900 flex items-center gap-2 text-sm uppercase tracking-wide">
          <div className="p-1.5 bg-red-100 rounded-md">
             <Flame className="w-4 h-4 text-red-600 fill-red-600" />
          </div>
          Sắp đến hạn
        </h3>
        <div className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-white">
        {urgentTasks.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {urgentTasks.map((task) => {
              const deadline = new Date(task.deadline!);
              const isOverdue = deadline < new Date();
              const timeLeft = formatDistanceToNow(deadline, { locale: vi, addSuffix: true });
              
              const projectName = task.projectName || "Dự án chưa đặt tên";
              const projectCode = `DA-${task.biddingProjectId}`; 

              return (
                <div key={task.id} className="p-4 hover:bg-red-50/30 cursor-pointer group transition-colors">
                  
                  {/* Dòng 1: Badges */}
                  {/* Mobile Fix: flex-wrap để tránh badges đè nhau khi màn hình nhỏ */}
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2.5">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-tight whitespace-nowrap">
                      {projectCode}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap border uppercase",
                      isOverdue 
                        ? "bg-red-100 text-red-700 border-red-200 animate-pulse" 
                        : "bg-orange-50 text-orange-600 border-orange-100"
                    )}>
                      {isOverdue ? "Quá hạn " : "Hạn: "} {timeLeft}
                    </span>
                  </div>

                  {/* Dòng 2: Tên dự án */}
                  <h4 
                    className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-red-700 transition-colors mb-2"
                    title={projectName} 
                  >
                    {projectName}
                  </h4>

                  {/* Dòng 3: Tên Task */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 group-hover:border-red-100 group-hover:bg-white transition-all">
                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span className="truncate font-medium text-slate-600">{task.taskName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center gap-3">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <CalendarClock className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium">Không có deadline gấp.</p>
            <p className="text-xs text-slate-400">Bạn đã kiểm soát tốt tiến độ!</p>
          </div>
        )}
      </ScrollArea>
      
      {/* Footer */}
      {/* Mobile: p-4 để vùng bấm rộng hơn */}
      <div className="p-4 md:p-3 bg-slate-50 border-t border-slate-200 text-center hover:bg-slate-100 transition-colors cursor-pointer shrink-0">
         <span className="text-xs font-bold text-[#009d98] hover:underline uppercase tracking-wide">Xem tất cả dự án</span>
      </div>
    </div>
  );
};