"use client";

import { ResourceStatsOverview } from "@/widgets/resource-stats-overview";

export const ResourceOverviewPage = () => {
  return (
    // 1. Thiết lập nền xám nhẹ (Slate-50) đồng bộ với toàn bộ Dashboard
    // h-full & overflow-y-auto: Đảm bảo cuộn mượt mà nếu nội dung dài
    <div className="h-full min-h-screen bg-slate-50/50 overflow-y-auto">
      
      {/* 2. Container giới hạn chiều rộng */}
      {/* max-w-7xl: Giữ nội dung không bị bè ra quá rộng trên màn hình 27inch+ */}
      <div className="container mx-auto max-w-7xl p-6 md:p-8">
         
         {/* Widget chính (Đã bao gồm Header, KPI, Charts, Table) */}
         <ResourceStatsOverview />
         
      </div>
    </div>
  );
};