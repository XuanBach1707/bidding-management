"use client";

import { ResourceStatsOverview } from "@/widgets/resource-stats-overview";

export const ResourceOverviewPage = () => {
  return (
    // 1. Root
    <div className="h-full min-h-screen bg-slate-50/50 overflow-y-auto">
      
      {/* 2. Container:
          - Mobile: p-4 (cho thoáng)
          - Desktop: p-8 (như cũ)
      */}
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
         
         {/* Widget chính: Đây là nơi chứa bom nổ chậm trên mobile */}
         <ResourceStatsOverview />
         
      </div>
    </div>
  );
};