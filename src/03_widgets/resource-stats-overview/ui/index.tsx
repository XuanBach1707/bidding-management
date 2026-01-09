"use client";

import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react"; // Icon header
import { 
  resourceApi, 
  ResourceStats, 
  ResourceItem, 
  RESOURCE_REPO_ROOT_ID 
} from "@/entities/resource";
import { ResourceKpiCards } from "./kpi-cards";
import { StructureChart } from "./structure-chart";
import { ActivityChart } from "./activity-chart";
import { RecentFiles } from "./recent-files"; 

export const ResourceStatsOverview = () => {
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [recentFiles, setRecentFiles] = useState<ResourceItem[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [statsData, folderData] = await Promise.all([
          resourceApi.getStats(),
          resourceApi.getFolderContent(RESOURCE_REPO_ROOT_ID)
        ]);

        setStats(statsData);
        
        const onlyFiles = (folderData.data || []).filter(item => item.type !== "FOLDER");
        setRecentFiles(onlyFiles);

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER PAGE (Optional but good for UX) */}
      <div className="flex flex-col gap-1">
         <div className="flex items-center gap-2 text-slate-800">
            <div className="p-2 bg-[#009d98]/10 rounded-lg">
                <HardDrive className="w-5 h-5 text-[#009d98]" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Tổng quan Tài nguyên</h2>
         </div>
         <p className="text-sm text-slate-500 ml-[44px]">
            Thống kê dung lượng, tần suất hoạt động và cơ cấu tài liệu của hệ thống.
         </p>
      </div>

      {/* 1. KPI Cards */}
      <ResourceKpiCards stats={stats} isLoading={isLoading} />

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[400px]">
        <div className="lg:col-span-1 h-full">
           <StructureChart 
              data={stats?.breakdown} 
              isLoading={isLoading} 
           />
        </div>
        <div className="lg:col-span-2 h-full">
           <ActivityChart />
        </div>
      </div>

      {/* 3. Recent Files Table */}
      <div className="min-h-[300px]">
         <RecentFiles files={recentFiles} isLoading={isLoading} />
      </div>
    </div>
  );
};