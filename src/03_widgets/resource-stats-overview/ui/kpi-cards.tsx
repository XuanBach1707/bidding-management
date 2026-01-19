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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 md:h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Tổng tài liệu",
      value: stats?.totalFiles?.toLocaleString() || "0",
      subtext: "+12% tháng trước", // Rút gọn text cho mobile
      trend: "up",
      icon: FileText,
      iconColor: "text-[#009d98]", 
      bgIcon: "bg-[#009d98]/10",
    },
    {
      title: "Dung lượng", // Rút gọn title
      value: stats?.totalSizeLabel || "45.2 GB", 
      subtext: "85% sử dụng",
      trend: "neutral",
      icon: HardDrive,
      iconColor: "text-orange-600",
      bgIcon: "bg-orange-50",
    },
    {
      title: "Hồ sơ dự án",
      value: "156", 
      subtext: "32 đang chạy",
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
    // [UPDATE] grid-cols-2 trên mobile (thay vì 1) để tiết kiệm chiều dọc
    // gap-3 (nhỏ hơn chút)
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, index) => (
        <div 
            key={index} 
            // [UPDATE] p-4 trên mobile, p-5 trên desktop
            className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <span className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider truncate mr-1">
                {card.title}
            </span>
            <div className={`p-1.5 md:p-2 rounded-lg ${card.bgIcon} ${card.iconColor} shrink-0`}>
              <card.icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          
          <div>
              <div className="text-xl md:text-2xl font-black text-slate-800 tabular-nums tracking-tight truncate">
                {card.value}
              </div>
              
              <div className={`text-[10px] md:text-xs mt-1 md:mt-2 flex items-center font-medium truncate ${
                  card.trend === 'up' ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                  {card.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1 shrink-0" />}
                  <span className="truncate">{card.subtext}</span>
              </div>
          </div>
        </div>
      ))}
    </div>
  );
};