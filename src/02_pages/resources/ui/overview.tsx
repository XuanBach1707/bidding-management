import { ResourceStatsOverview } from "@/widgets/resource-stats-overview";

export const ResourceOverviewPage = () => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Page Header - Có thể tách thành shared UI nếu muốn dùng chung */}
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">Tổng quan tài nguyên</h2>
        <p className="text-slate-500 text-sm">Thống kê dữ liệu và tần suất hoạt động</p>
      </div>

      {/* Widget Injection */}
      <div className="flex-1 overflow-auto min-h-0">
         <ResourceStatsOverview />
      </div>
    </div>
  );
};