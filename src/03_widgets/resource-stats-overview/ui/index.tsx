"use client";

import { useEffect, useState } from "react";
import { 
  resourceApi, 
  ResourceStats, 
  ResourceItem, 
  RESOURCE_REPO_ROOT_ID 
} from "@/entities/resource";
import { ResourceKpiCards } from "./kpi-cards";
import { StructureChart } from "./structure-chart";
import { ActivityChart } from "./activity-chart";
// [MỚI] Import component RecentFiles
import { RecentFiles } from "./recent-files"; 

export const ResourceStatsOverview = () => {
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [recentFiles, setRecentFiles] = useState<ResourceItem[]>([]); // [MỚI] State lưu file
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Gọi song song 2 API để tiết kiệm thời gian
        const [statsData, folderData] = await Promise.all([
          resourceApi.getStats(),
          resourceApi.getFolderContent(RESOURCE_REPO_ROOT_ID)
        ]);

        setStats(statsData);
        
        // Lọc chỉ lấy FILE (bỏ Folder) để hiển thị ở bảng "Tập tin gần đây"
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* 1. Phần thẻ bài KPI */}
      <ResourceKpiCards stats={stats} isLoading={isLoading} />

      {/* 2. Phần biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
           <StructureChart />
        </div>
        <div className="lg:col-span-2">
           <ActivityChart />
        </div>
      </div>

      {/* 3. [MỚI] Phần Tập tin gần đây -> Lấp chỗ trống phía dưới */}
      <RecentFiles files={recentFiles} isLoading={isLoading} />
    </div>
  );
};