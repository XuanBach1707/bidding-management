import { 
  FileText, HardDrive, Briefcase, Share2, TrendingUp, TrendingDown 
} from "lucide-react";
import { ResourceStats } from "@/entities/resource";
import { Skeleton } from "@/shared/ui/skeleton";

interface ResourceKpiCardsProps {
  stats: ResourceStats | null;
  isLoading: boolean;
}

export const ResourceKpiCards = ({ stats, isLoading }: ResourceKpiCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Tổng tài liệu",
      value: stats?.totalFiles?.toLocaleString() || "0",
      subtext: "+12% so với tháng trước",
      trend: "up",
      icon: FileText,
      // Dùng màu Teal làm chủ đạo cho chỉ số chính
      iconColor: "text-[#009d98]", 
      bgIcon: "bg-[#009d98]/10",
    },
    {
      title: "Dung lượng sử dụng",
      value: stats?.totalSizeLabel || "45.2 GB", 
      subtext: "85% tổng dung lượng",
      trend: "neutral",
      icon: HardDrive,
      iconColor: "text-orange-600",
      bgIcon: "bg-orange-50",
    },
    {
      title: "Hồ sơ dự án",
      value: "156", 
      subtext: "32 dự án đang chạy",
      trend: "neutral",
      icon: Briefcase,
      iconColor: "text-purple-600",
      bgIcon: "bg-purple-50",
    },
    {
      title: "Lượt truy cập",
      value: "892",
      subtext: "+5% tuần này",
      trend: "up",
      icon: Share2,
      iconColor: "text-blue-600",
      bgIcon: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div 
            key={index} 
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{card.title}</span>
            <div className={`p-2 rounded-lg ${card.bgIcon} ${card.iconColor}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
          
          <div className="text-2xl font-black text-slate-800 tabular-nums tracking-tight">
            {card.value}
          </div>
          
          <div className={`text-xs mt-2 flex items-center font-medium ${
              card.trend === 'up' ? 'text-emerald-600' : 'text-slate-400'
          }`}>
             {card.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
             {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};