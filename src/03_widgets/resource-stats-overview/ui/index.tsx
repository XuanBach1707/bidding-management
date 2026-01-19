"use client";

import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react"; 
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
        // Promise.all giúp tải song song nhanh hơn
        const [statsData, folderData] = await Promise.all([
          resourceApi.getStats(),
          resourceApi.getFolderContent(RESOURCE_REPO_ROOT_ID)
        ]);
        setStats(statsData);
        // Lọc chỉ lấy file, bỏ folder
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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col gap-2">
         <div className="flex items-start md:items-center gap-3 text-slate-800">
            <div className="p-2 bg-[#009d98]/10 rounded-lg shrink-0 mt-1 md:mt-0">
               <HardDrive className="w-5 h-5 text-[#009d98]" />
            </div>
            <div>
                <h2 className="text-lg md:text-xl font-extrabold tracking-tight leading-tight">
                    Tổng quan Tài nguyên
                </h2>
                {/* Trên mobile, description đưa vào đây luôn để căn lề thẳng với title */}
                <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
                    Thống kê dung lượng, tần suất hoạt động và cơ cấu tài liệu.
                </p>
            </div>
         </div>
      </div>

      {/* 1. KPI Cards: Cần check xem có grid-cols-2 trên mobile chưa */}
      <ResourceKpiCards stats={stats} isLoading={isLoading} />

      {/* 2. Charts Section */}
      {/* - Mobile: h-auto (để nội dung tự đẩy cao tùy thích)
          - Desktop: h-[400px] (cố định chiều cao cho đẹp)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[400px]">
        {/* Biểu đồ tròn (Structure) */}
        <div className="lg:col-span-1 h-[300px] lg:h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           {/* Bọc div ngoài để đảm bảo height cho chart con */}
           <StructureChart 
              data={stats?.breakdown} 
              isLoading={isLoading} 
           />
        </div>
        
        {/* Biểu đồ cột/đường (Activity) */}
        <div className="lg:col-span-2 h-[300px] lg:h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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