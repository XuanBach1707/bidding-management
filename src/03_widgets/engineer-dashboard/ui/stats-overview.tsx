"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Briefcase, TrendingUp } from "lucide-react";
import { taskApi } from "@/entities/task/api/task-api";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export const StatsOverview = () => {
  const [stats, setStats] = useState({ completed: 0, overdue: 0, projectCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tasks = await taskApi.getAssignedTasks();
        const now = new Date();
        
        const completed = tasks.filter(t => t.status === "COMPLETED").length;
        
        const overdue = tasks.filter(t => {
           if (t.status === "COMPLETED" || !t.deadline) return false;
           return new Date(t.deadline) < now;
        }).length;

        const uniqueProjects = new Set(tasks.map(t => t.biddingProjectId).filter(Boolean));

        setStats({ completed, overdue, projectCount: uniqueProjects.size });
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
      <Skeleton className="h-24 md:h-28 rounded-xl" />
      <Skeleton className="h-24 md:h-28 rounded-xl" />
      <Skeleton className="h-24 md:h-28 rounded-xl col-span-2 lg:col-span-1" />
      <Skeleton className="h-24 md:h-28 rounded-xl col-span-2" />
    </div>
  );

  return (
    // Mobile: Grid 2 cột (grid-cols-2) để tiết kiệm diện tích dọc. Gap nhỏ (gap-3).
    // PC: Grid 5 cột như cũ.
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
      
      {/* Stat 1: Hoàn thành */}
      <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 transition hover:shadow-md group cursor-pointer hover:border-[#009d98]/30">
        <div className="p-2 md:p-3 bg-[#009d98]/10 text-[#009d98] rounded-lg md:rounded-xl group-hover:bg-[#009d98] group-hover:text-white transition-colors">
           <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
           <p className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5 md:mb-1">Hoàn thành</p>
           {/* Mobile: text-xl. PC: text-2xl */}
           <p className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-[#009d98] transition-colors">
             {stats.completed} <span className="hidden md:inline text-xs font-semibold text-slate-400 uppercase">Tasks</span>
           </p>
        </div>
      </div>

      {/* Stat 2: Quá hạn */}
      <div className={cn(
          "bg-white p-3 md:p-5 rounded-xl border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 transition hover:shadow-md group cursor-pointer",
          stats.overdue > 0 ? "border-l-4 border-l-red-500 border-t-slate-200 border-r-slate-200 border-b-slate-200" : "border-slate-200"
      )}>
        <div className="p-2 md:p-3 bg-red-50 text-red-600 rounded-lg md:rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
           <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
           <p className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5 md:mb-1">Quá hạn</p>
           <p className="text-xl md:text-2xl font-black text-red-600">
             {stats.overdue} <span className="hidden md:inline text-xs font-semibold text-slate-400 uppercase">Tasks</span>
           </p>
        </div>
      </div>

      {/* Stat 3: Dự án */}
      {/* Mobile: col-span-2 (chiếm hết dòng) hoặc col-span-1 tùy ý. 
          Ở đây tôi để col-span-2 để nó nằm ngang cho đẹp hàng với KPI bên dưới hoặc để riêng. 
          Tuy nhiên để cân đối 2x2, tôi sẽ để nó col-span-2 ở mobile nếu muốn nhấn mạnh, hoặc col-span-1 nếu muốn gọn.
          -> Quyết định: Để col-span-2 trên mobile để tạo điểm nghỉ mắt.
      */}
      <div className="col-span-2 lg:col-span-1 bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-row items-center gap-4 transition hover:shadow-md group cursor-pointer hover:border-purple-300">
        <div className="p-2 md:p-3 bg-purple-50 text-purple-600 rounded-lg md:rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
           <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
           <p className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5 md:mb-1">Dự án tham gia</p>
           <p className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">
             {stats.projectCount} <span className="text-xs font-semibold text-slate-400 uppercase">Active</span>
           </p>
        </div>
      </div>

      {/* Stat 4: Hiệu suất (KPI) */}
      <div className="col-span-2 bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition hover:shadow-md group cursor-pointer">
          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#009d98] transition-all group-hover:w-2"></div>
          <div className="flex flex-col h-full justify-between gap-3 md:gap-0">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Hiệu suất</p>
                          <p className="text-xl md:text-2xl font-black text-[#009d98]">94/100 <span className="text-xs md:text-sm font-bold text-slate-400">KPI</span></p>
                      </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">TOP 10%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 md:h-2 overflow-hidden">
                  <div className="bg-[#009d98] h-full rounded-full transition-all duration-1000 ease-out group-hover:bg-emerald-500" style={{ width: "94%" }}></div>
              </div>
          </div>
      </div>
    </div>
  );
};