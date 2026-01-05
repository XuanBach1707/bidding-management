"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Briefcase } from "lucide-react";
import { taskApi } from "@/entities/task/api/task-api";
import { Skeleton } from "@/shared/ui/skeleton";

export const StatsOverview = () => {
  const [stats, setStats] = useState({ completed: 0, overdue: 0, projectCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tasks = await taskApi.getAssignedTasks();
        const now = new Date();
        
        // 1. Task hoàn thành (Logic: status = COMPLETED)
        const completed = tasks.filter(t => t.status === "COMPLETED").length;
        
        // 2. Quá hạn (Logic: chưa xong VÀ deadline < now)
        const overdue = tasks.filter(t => {
           if (t.status === "COMPLETED" || !t.deadline) return false;
           return new Date(t.deadline) < now;
        }).length;

        // 3. Số dự án (Unique biddingProjectId)
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

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
  </div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Stat 1: Hoàn thành */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition hover:shadow-md">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
           <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
           <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Hoàn thành</p>
           <p className="text-2xl font-bold text-slate-800">{stats.completed} <span className="text-sm font-medium text-slate-400">tasks</span></p>
        </div>
      </div>

      {/* Stat 2: Quá hạn */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition hover:shadow-md border-l-4 border-l-red-500">
        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
           <AlertCircle className="w-6 h-6" />
        </div>
        <div>
           <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Quá hạn</p>
           <p className="text-2xl font-bold text-red-600">{stats.overdue} <span className="text-sm font-medium text-slate-400">tasks</span></p>
        </div>
      </div>

      {/* Stat 3: Dự án */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition hover:shadow-md">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
           <Briefcase className="w-6 h-6" />
        </div>
        <div>
           <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Dự án tham gia</p>
           <p className="text-2xl font-bold text-slate-800">{stats.projectCount} <span className="text-sm font-medium text-slate-400">dự án</span></p>
        </div>
      </div>

      {/* Stat 4: Hiệu suất (Fake UI để lấp đầy grid như mẫu) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-2 relative overflow-hidden transition hover:shadow-md group">
          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-green-500 transition-all group-hover:w-2"></div>
          <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wide mb-1">Hiệu suất cá nhân</p>
                      <p className="text-2xl font-bold text-green-600">94/100 <span className="text-sm text-slate-800">điểm</span></p>
                  </div>
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Top 10%</span>
              </div>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "94%" }}></div>
              </div>
          </div>
      </div>
    </div>
  );
};