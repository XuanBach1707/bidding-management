"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckSquare, Plus, Calendar, Clock, AlertCircle, Edit3, Trash2 } from "lucide-react";

// Shadcn & Shared
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

// Entities
import { taskApi } from "@/entities/task/api/task-api";
import { Task } from "@/entities/task/model/types";
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from "@/entities/task/model/constants";

export const DailyTasksWidget = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "TODO" | "WAITING" | "DONE">("TODO");

  // 1. Fetch Real Data
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await taskApi.getAssignedTasks();
        setTasks(data);
      } catch (err) {
        console.error("Lỗi tải task dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // 2. Client-side Filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "ALL") return true;
      if (filter === "DONE") return t.status === "COMPLETED";
      if (filter === "WAITING") return t.status === "PENDING_REVIEW";
      if (filter === "TODO") return ["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(t.status);
      return true;
    });
  }, [tasks, filter]);

  // UI Constants cho Filter Buttons
  const getFilterBtnClass = (active: boolean) => 
    cn(
      "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
      active 
        ? "bg-blue-50 text-blue-700 border-blue-100 font-semibold" 
        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
    );

  if (loading) return <Skeleton className="h-[600px] w-full rounded-xl" />;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
      {/* --- HEADER --- */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              Nhiệm vụ của tôi
            </h3>
            <p className="text-sm text-slate-500">
              {tasks.filter(t => ["ASSIGNED", "IN_PROGRESS"].includes(t.status)).length} công việc cần hoàn thành
            </p>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1 shadow-sm shadow-blue-200 text-white">
            <Plus className="w-4 h-4" /> Tạo mới
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2">
          <button onClick={() => setFilter("ALL")} className={getFilterBtnClass(filter === "ALL")}>Tất cả</button>
          <button onClick={() => setFilter("TODO")} className={getFilterBtnClass(filter === "TODO")}>Cần làm</button>
          <button onClick={() => setFilter("WAITING")} className={getFilterBtnClass(filter === "WAITING")}>Đang chờ</button>
          <button onClick={() => setFilter("DONE")} className={getFilterBtnClass(filter === "DONE")}>Đã xong</button>
        </div>
      </div>

      {/* --- TASK LIST --- */}
      <ScrollArea className="flex-1 p-3 bg-slate-50/50">
        <div className="space-y-2 pr-3">
          {filteredTasks.map((task) => {
             const isDone = task.status === "COMPLETED";
             const priority = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.LOW;
             const statusInfo = TASK_STATUS_CONFIG[task.status];
             const deadlineDate = task.deadline ? new Date(task.deadline) : null;
             
             // Check quá hạn
             const isOverdue = !isDone && deadlineDate && deadlineDate < new Date();

             return (
               <div 
                 key={task.id}
                 className={cn(
                   "group flex items-start gap-3 p-3 bg-white border rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer",
                   isDone ? "opacity-75 bg-slate-50 border-transparent" : "border-slate-200 hover:border-blue-300"
                 )}
               >
                  {/* Checkbox giả */}
                  <div className="mt-1">
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                      isDone 
                        ? "bg-green-500 border-green-500 text-white" 
                        : "border-slate-300 group-hover:border-blue-500"
                    )}>
                      {isDone && <CheckSquare className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={cn(
                        "text-sm font-semibold truncate transition-colors",
                        isDone ? "text-slate-500 line-through" : "text-slate-800 group-hover:text-blue-600"
                      )}>
                        {task.taskName}
                      </h4>
                      
                      {/* Actions (Hiện khi hover) */}
                      {!isDone && (
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                          <button className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                       {/* Project Code (Lấy tạm ID hoặc Name) */}
                       {task.biddingProjectId && (
                         <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                           DA-{task.biddingProjectId}
                         </span>
                       )}

                       {/* Priority Badge */}
                       {!isDone && (
                         <span className={cn(
                           "text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                           priority.color
                         )}>
                           {task.priority === "HIGH" && <AlertCircle className="w-3 h-3" />}
                           {priority.label}
                         </span>
                       )}

                       {/* Deadline */}
                       {deadlineDate && (
                         <span className={cn(
                           "text-xs font-medium flex items-center gap-1",
                           isOverdue ? "text-red-500" : isDone ? "text-green-600" : "text-slate-500"
                         )}>
                           {isDone ? (
                             "Đã xong"
                           ) : (
                             <>
                               <Clock className="w-3 h-3" />
                               {format(deadlineDate, "dd/MM HH:mm", { locale: vi })}
                             </>
                           )}
                         </span>
                       )}
                    </div>
                  </div>
               </div>
             );
          })}
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-10 text-slate-400">Không có nhiệm vụ nào</div>
          )}
        </div>
      </ScrollArea>
      
      {/* Footer link */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-xl text-center cursor-pointer hover:bg-slate-100 transition-colors">
         <span className="text-sm font-medium text-blue-600 flex items-center justify-center gap-2">
             Xem toàn bộ nhiệm vụ
         </span>
      </div>
    </div>
  );
};