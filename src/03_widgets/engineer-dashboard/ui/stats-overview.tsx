"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Briefcase, Layers, TrendingUp } from "lucide-react";
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
        
        // 1. Task hoàn thành
        const completed = tasks.filter(t => t.status === "COMPLETED").length;
        
        // 2. Quá hạn
        const overdue = tasks.filter(t => {
           if (t.status === "COMPLETED" || !t.deadline) return false;
           return new Date(t.deadline) < now;
        }).length;

        // 3. Số dự án
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-28 rounded-xl col-span-2" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      
      {/* Stat 1: Hoàn thành */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition hover:shadow-md group cursor-pointer hover:border-[#009d98]/30">
        <div className="p-3 bg-[#009d98]/10 text-[#009d98] rounded-xl group-hover:bg-[#009d98] group-hover:text-white transition-colors">
           <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
           <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Hoàn thành</p>
           <p className="text-2xl font-black text-slate-800 group-hover:text-[#009d98] transition-colors">
             {stats.completed} <span className="text-xs font-semibold text-slate-400 uppercase">Tasks</span>
           </p>
        </div>
      </div>

      {/* Stat 2: Quá hạn */}
      <div className={cn(
          "bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4 transition hover:shadow-md group cursor-pointer",
          stats.overdue > 0 ? "border-l-4 border-l-red-500 border-t-slate-200 border-r-slate-200 border-b-slate-200" : "border-slate-200"
      )}>
        <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
           <AlertCircle className="w-6 h-6" />
        </div>
        <div>
           <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Quá hạn</p>
           <p className="text-2xl font-black text-red-600">
             {stats.overdue} <span className="text-xs font-semibold text-slate-400 uppercase">Tasks</span>
           </p>
        </div>
      </div>

      {/* Stat 3: Dự án */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition hover:shadow-md group cursor-pointer hover:border-purple-300">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
           <Briefcase className="w-6 h-6" />
        </div>
        <div>
           <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Dự án</p>
           <p className="text-2xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">
             {stats.projectCount} <span className="text-xs font-semibold text-slate-400 uppercase">Active</span>
           </p>
        </div>
      </div>

      {/* Stat 4: Hiệu suất (Fake UI) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm md:col-span-2 relative overflow-hidden transition hover:shadow-md group cursor-pointer">
          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#009d98] transition-all group-hover:w-2"></div>
          <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Hiệu suất cá nhân</p>
                          <p className="text-2xl font-black text-[#009d98]">94/100 <span className="text-sm font-bold text-slate-400">KPI</span></p>
                      </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">TOP 10%</span>
              </div>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#009d98] h-2 rounded-full transition-all duration-1000 ease-out group-hover:bg-emerald-500" style={{ width: "94%" }}></div>
              </div>
          </div>
      </div>
    </div>
  );
};