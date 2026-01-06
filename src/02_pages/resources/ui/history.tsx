import { ResourceArchiveHistory } from "@/widgets/resource-archive-history";

export const ResourceHistoryPage = () => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">Lịch sử lưu trữ</h2>
        <p className="text-slate-500 text-sm">Tra cứu hồ sơ dự án theo năm</p>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <ResourceArchiveHistory />
      </div>
    </div>
  );
};