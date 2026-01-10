"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckSquare, Calendar, Clock, AlertCircle, Edit3, Trash2, ListTodo } from "lucide-react"; 

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
      "text-xs font-bold px-3 py-1.5 rounded-lg border transition-all uppercase tracking-tight",
      active 
        ? "bg-[#009d98]/10 text-[#009d98] border-[#009d98]/30 shadow-sm" 
        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
    );

  if (loading) return <Skeleton className="h-[600px] w-full rounded-xl" />;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
      {/* --- HEADER --- */}
      <div className="p-5 border-b border-slate-100 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <div className="p-1.5 bg-[#009d98]/10 rounded-md">
                  <ListTodo className="w-5 h-5 text-[#009d98]" />
              </div>
              Nhiệm vụ của tôi
            </h3>
            <p className="text-sm text-slate-500 mt-1 font-medium pl-10">
              Bạn có <span className="text-[#009d98] font-bold">{tasks.filter(t => ["ASSIGNED", "IN_PROGRESS"].includes(t.status)).length}</span> công việc cần hoàn thành
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 p-1 bg-slate-50 rounded-lg w-fit">
          <button onClick={() => setFilter("ALL")} className={getFilterBtnClass(filter === "ALL")}>Tất cả</button>
          <button onClick={() => setFilter("TODO")} className={getFilterBtnClass(filter === "TODO")}>Cần làm</button>
          <button onClick={() => setFilter("WAITING")} className={getFilterBtnClass(filter === "WAITING")}>Đang chờ</button>
          <button onClick={() => setFilter("DONE")} className={getFilterBtnClass(filter === "DONE")}>Đã xong</button>
        </div>
      </div>

      {/* --- TASK LIST --- */}
      <ScrollArea className="flex-1 p-4 bg-slate-50/30">
        <div className="space-y-3 pr-2">
          {filteredTasks.length === 0 ? (
             <div className="text-center py-20 text-slate-400 text-sm italic">Không có nhiệm vụ nào.</div>
          ) : (
             filteredTasks.map((task) => {
                const isDone = task.status === "COMPLETED";
                const priority = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.LOW;
                // const statusInfo = TASK_STATUS_CONFIG[task.status]; // Giữ lại nếu cần dùng màu status
                const deadlineDate = task.deadline ? new Date(task.deadline) : null;
                
                // Check quá hạn
                const isOverdue = !isDone && deadlineDate && deadlineDate < new Date();

                return (
                  <div 
                    key={task.id}
                    className={cn(
                      "group flex items-start gap-4 p-4 bg-white border rounded-xl transition-all cursor-pointer relative overflow-hidden",
                      isDone 
                        ? "opacity-60 bg-slate-50 border-slate-100" 
                        : "border-slate-200 hover:border-[#009d98]/50 hover:shadow-md hover:translate-y-[-1px]"
                    )}
                  >
                    {/* Status Bar Indicator */}
                    <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        isDone ? "bg-slate-300" : isOverdue ? "bg-red-500" : "bg-[#009d98]"
                    )} />

                    {/* Checkbox giả */}
                    <div className="mt-0.5">
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                        isDone 
                          ? "bg-slate-300 border-slate-300 text-white" 
                          : "border-slate-300 group-hover:border-[#009d98]"
                      )}>
                        {isDone && <CheckSquare className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={cn(
                          "text-sm font-bold truncate transition-colors pr-2",
                          isDone ? "text-slate-500 line-through" : "text-slate-800 group-hover:text-[#009d98]"
                        )}>
                          {task.taskName}
                        </h4>
                        
                        {/* Actions (Hiện khi hover) */}
                        {!isDone && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 text-slate-400 hover:text-[#009d98] rounded-full hover:bg-[#009d98]/10 transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                          {/* Project Code */}
                          {task.biddingProjectId && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-tight">
                              DA-{task.biddingProjectId}
                            </span>
                          )}

                          {/* Priority Badge */}
                          {!isDone && (
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 uppercase",
                              task.priority === "HIGH" 
                                ? "bg-red-50 text-red-600 border-red-200" 
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            )}>
                              {task.priority === "HIGH" && <AlertCircle className="w-3 h-3" />}
                              {priority.label}
                            </span>
                          )}

                          {/* Deadline */}
                          {deadlineDate && (
                            <span className={cn(
                              "text-[10px] font-bold flex items-center gap-1",
                              isOverdue ? "text-red-500" : isDone ? "text-slate-400" : "text-slate-500"
                            )}>
                              {isOverdue ? (
                                 <span className="flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                    <Clock className="w-3 h-3" /> Quá hạn
                                 </span>
                              ) : (
                                 <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {format(deadlineDate, "dd/MM", { locale: vi })}
                                 </span>
                              )}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                );
             })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};