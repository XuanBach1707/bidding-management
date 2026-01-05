"use client";

import { useEffect, useState } from "react";
import { Flame, Briefcase, CalendarClock } from "lucide-react"; // Đổi icon cho hợp ngữ cảnh
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
        // 1. Gọi API lấy task được giao
        const tasks = await taskApi.getAssignedTasks();
        
        const now = new Date();
        
        // 2. Lọc & Sắp xếp
        const sorted = tasks
          .filter((t) => {
            // Chỉ lấy task chưa xong và có deadline
            if (t.status === "COMPLETED" || !t.deadline) return false;
            // Chỉ lấy task deadline trong tương lai (hoặc quá hạn nhưng chưa xong)
            // Nếu muốn hiện cả quá hạn thì bỏ điều kiện > now
            return true; 
          })
          .sort((a, b) => {
             // Sort deadline gần nhất lên đầu
             return new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();
          })
          .slice(0, 5); // Lấy top 5 việc gấp nhất

        setUrgentTasks(sorted);
      } catch (error) {
        console.error("Lỗi tải deadline:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUrgentWork();
  }, []);

  if (loading) return <Skeleton className="h-[500px] w-full rounded-xl" />;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
      {/* Header: Đổi thành "Tiến độ gấp" hoặc "Sắp đến hạn" vì không lấy được ngày đóng thầu gốc */}
      <div className="p-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
          <Flame className="w-4 h-4 text-red-600 fill-red-600" />
          Sắp đến hạn
        </h3>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      </div>

      <ScrollArea className="flex-1 p-1">
        {urgentTasks.length > 0 ? (
          urgentTasks.map((task) => {
            const deadline = new Date(task.deadline!);
            const isOverdue = deadline < new Date();
            const timeLeft = formatDistanceToNow(deadline, { locale: vi, addSuffix: true });
            
            // Xử lý tên dự án dài quá
            const projectName = task.projectName || "Dự án chưa đặt tên";
            // Lấy mã dự án giả lập từ ID (vì API không trả về Project Code ngắn)
            const projectCode = `DA-${task.biddingProjectId}`; 

            return (
              <div key={task.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer group transition-colors">
                
                {/* Dòng 1: Badge Mã Dự Án + Badge Thời gian */}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {projectCode}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap border",
                    isOverdue 
                      ? "bg-red-100 text-red-700 border-red-200" // Quá hạn: Đỏ đậm
                      : "bg-white text-orange-600 border-orange-200" // Sắp đến: Cam
                  )}>
                    {isOverdue ? "Quá hạn " : "Hạn: "} {timeLeft}
                  </span>
                </div>

                {/* Dòng 2: Tên dự án (Main Title) */}
                <h4 
                  className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1"
                  title={projectName} // Tooltip native để xem full tên
                >
                  {projectName}
                </h4>

                {/* Dòng 3: Tên Task đang làm (Sub Title) */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Briefcase className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">Nhiệm vụ: <span className="font-medium text-slate-600">{task.taskName}</span></span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
            <CalendarClock className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">Không có deadline gấp.</p>
          </div>
        )}
      </ScrollArea>
      
      {/* Footer fake link */}
      <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
         <button className="text-xs font-medium text-blue-600 hover:text-blue-800">Xem tất cả dự án</button>
      </div>
    </div>
  );
};