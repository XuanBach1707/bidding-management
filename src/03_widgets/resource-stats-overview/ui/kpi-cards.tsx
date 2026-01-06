import { 
  FileText, 
  HardDrive, 
  Briefcase, 
  Share2, 
  TrendingUp 
} from "lucide-react";
import { ResourceStats } from "@/entities/resource";

interface ResourceKpiCardsProps {
  stats: ResourceStats | null;
  isLoading: boolean;
}

export const ResourceKpiCards = ({ stats, isLoading }: ResourceKpiCardsProps) => {
  // Skeleton Loader khi đang tải
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-100 p-6 rounded-lg border border-slate-200 shadow-sm h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  // Cấu hình danh sách thẻ (Mix giữa Real Data và Fake Data)
  const cards = [
    {
      title: "Tổng số tài liệu",
      // [REAL DATA]: Lấy từ API
      value: stats?.totalFiles?.toLocaleString() || "0",
      subtext: "+12% tháng này",
      subColor: "text-green-600",
      icon: FileText,
      iconColor: "text-blue-600",
      bgIcon: "bg-blue-50",
    },
    {
      title: "Dung lượng",
      // [MOCK DATA]: Vì API stats/count chưa trả về size
      value: stats?.totalSizeLabel || "45.2 GB", 
      subtext: "85% tổng dung lượng",
      subColor: "text-slate-500",
      icon: HardDrive,
      iconColor: "text-orange-600",
      bgIcon: "bg-orange-50",
    },
    {
      title: "Hồ sơ dự án",
      // [MOCK DATA]: Giả lập số lượng dự án active
      value: "156", 
      subtext: "32 đang hoạt động",
      subColor: "text-slate-500",
      icon: Briefcase,
      iconColor: "text-purple-600",
      bgIcon: "bg-purple-50",
    },
    {
      title: "Lượt truy cập",
      // [MOCK DATA]: Số liệu giả
      value: "892",
      subtext: "+5% tuần trước",
      subColor: "text-green-600",
      icon: Share2,
      iconColor: "text-green-600",
      bgIcon: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 text-sm font-medium">{card.title}</span>
            <div className={`p-2 rounded ${card.bgIcon} ${card.iconColor}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{card.value}</div>
          <div className={`text-xs mt-1 flex items-center ${card.subColor}`}>
             {/* Chỉ hiện icon tăng trưởng ở thẻ 1 và 4 cho giống mẫu */}
             {(index === 0 || index === 3) && <TrendingUp className="w-3 h-3 mr-1" />}
             {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};