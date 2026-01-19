// structure-chart.tsx
"use client";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, ChartData, ChartOptions } from "chart.js";
import { Loader2, PieChart } from "lucide-react";
import { ResourceBreakdownItem } from "@/entities/resource";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

ChartJS.register(ArcElement, Tooltip);

const COLORS = [
  '#009d98', '#f59e0b', '#64748b', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e',
];

interface StructureChartProps {
  data?: ResourceBreakdownItem[]; 
  isLoading: boolean;
}

export const StructureChart = ({ data = [], isLoading }: StructureChartProps) => {

  const chartData: ChartData<'doughnut'> = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };
    return {
      labels: data.map(item => item.name),
      datasets: [
        {
          data: data.map(item => item.count),
          backgroundColor: COLORS,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<'doughnut'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
            label: (context) => ` ${context.label}: ${context.raw} file`
        }
      }
    },
    cutout: '75%', 
    layout: { padding: 0 }
  }), []);

  const totalFiles = useMemo(() => data.reduce((acc, item) => acc + item.count, 0), [data]);

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <h3 className="font-bold text-slate-800 text-xs md:text-sm uppercase tracking-wide mb-4 md:mb-6 shrink-0">
        Cơ cấu tài liệu
      </h3>
      
      {/* [UPDATE] Layout Flex:
          - Mobile: flex-col (Dọc) -> Chart nhỏ lại, Legend nằm dưới
          - Desktop: flex-row (Ngang) -> Chart to, Legend nằm phải
      */}
      <div className="flex-1 flex flex-col lg:flex-row items-center gap-4 lg:gap-6 min-h-0">
        
        {/* --- 1. CHART AREA --- */}
        {/* Mobile: w-36 h-36 | Desktop: w-48 h-48 */}
        <div className="relative w-36 h-36 lg:w-48 lg:h-48 shrink-0"> 
            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center text-[#009d98]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                    <PieChart className="w-10 h-10 mb-1 opacity-20" />
                    <span className="text-[10px]">No Data</span>
                </div>
            ) : (
                <>
                    <Doughnut data={chartData} options={options} />
                    
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl lg:text-3xl font-black text-slate-800 tabular-nums leading-none">
                            {totalFiles}
                        </span>
                        <span className="text-[9px] lg:text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                            Files
                        </span>
                    </div>
                </>
            )}
        </div>

        {/* --- 2. LEGEND AREA --- */}
        <div className="flex-1 w-full min-w-0 min-h-0">
            {isLoading ? (
                <div className="space-y-2">
                    {[1,2,3].map(i => <div key={i} className="h-4 bg-slate-50 rounded w-full animate-pulse" />)}
                </div>
            ) : (
                // [UPDATE] Mobile ScrollArea height thấp hơn để vừa khung 300px
                <ScrollArea className="h-28 lg:h-48 pr-3">
                    {/* [UPDATE] Mobile: Grid 2 cột để hiển thị gọn gàng hơn. Desktop: 1 cột */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-2 gap-y-3 lg:gap-y-3">
                        {data.map((item, index) => (
                            <div key={index} className="flex items-start justify-between text-xs group">
                                <div className="flex items-start gap-2 min-w-0">
                                    <span 
                                        className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" 
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                                    />
                                    {/* Truncate tên trên mobile */}
                                    <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors truncate max-w-[80px] lg:max-w-none" title={item.name}>
                                        {item.name}
                                    </span>
                                </div>
                                <span className="font-bold text-slate-700 tabular-nums pl-1">
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>

      </div>
    </div>
  );
};