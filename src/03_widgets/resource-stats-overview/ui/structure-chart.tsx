"use client";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, ChartData, ChartOptions } from "chart.js";
import { Loader2, PieChart } from "lucide-react";
import { ResourceBreakdownItem } from "@/entities/resource";
import { ScrollArea } from "@/shared/ui/scroll-area"; // Dùng cái này nếu danh sách dài

ChartJS.register(ArcElement, Tooltip); // Bỏ Legend ra khỏi register vì ta tự làm

// Palette màu chuẩn
const COLORS = [
  '#009d98', // Teal
  '#f59e0b', // Amber
  '#64748b', // Slate
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
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

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // [QUAN TRỌNG] Tắt legend mặc định để biểu đồ cân giữa
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
            label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return ` ${label}: ${value} file`;
            }
        }
      }
    },
    cutout: '75%', 
    layout: {
        padding: 0 // Đảm bảo không có padding thừa
    }
  };

  const totalFiles = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-6">Cơ cấu tài liệu</h3>
      
      <div className="flex-1 flex flex-col lg:flex-row items-center gap-6">
        
        {/* --- CỘT TRÁI: BIỂU ĐỒ (Chiếm 50% hoặc fixed width) --- */}
        {/* Relative để căn absolute text vào giữa chính nó */}
        <div className="relative w-48 h-48 shrink-0"> 
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
                    
                    {/* Center Text: Giờ nó nằm giữa cái div w-48 h-48 nên chuẩn 100% */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-slate-800 tabular-nums leading-none">
                            {totalFiles}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Files</span>
                    </div>
                </>
            )}
        </div>

        {/* --- CỘT PHẢI: CUSTOM LEGEND (Tự vẽ bằng HTML) --- */}
        <div className="flex-1 w-full min-w-0">
            {isLoading ? (
                <div className="space-y-2">
                    {[1,2,3].map(i => <div key={i} className="h-4 bg-slate-50 rounded w-full animate-pulse" />)}
                </div>
            ) : (
                <ScrollArea className="h-48 pr-4"> {/* Scroll nếu danh sách quá dài */}
                    <div className="space-y-3">
                        {data.map((item, index) => (
                            <div key={index} className="flex items-start justify-between text-xs group">
                                <div className="flex items-start gap-2">
                                    {/* Dot màu */}
                                    <span 
                                        className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" 
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                                    />
                                    <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                                        {item.name}
                                    </span>
                                </div>
                                <span className="font-bold text-slate-700 tabular-nums pl-2">
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>

      </div>
      
      {!isLoading && data.length > 0 && (
         <div className="mt-2 pt-4 border-t border-slate-50 text-center">
             <p className="text-[10px] text-slate-400 italic">
               *Dữ liệu từ kho lưu trữ
             </p>
         </div>
      )}
    </div>
  );
};