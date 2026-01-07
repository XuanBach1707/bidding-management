"use client";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Loader2, PieChart } from "lucide-react";
// Import Type từ entity (đảm bảo file types.ts đã có ResourceBreakdownItem)
import { ResourceBreakdownItem } from "@/entities/resource";

ChartJS.register(ArcElement, Tooltip, Legend);

// Palette màu mở rộng (để đủ màu nếu có nhiều loại hồ sơ)
const COLORS = [
  '#3b82f6', // blue-500
  '#fb923c', // orange-400
  '#a855f7', // purple-500
  '#4ade80', // green-400
  '#f43f5e', // rose-500
  '#06b6d4', // cyan-500
  '#eab308', // yellow-500
  '#64748b', // slate-500
];

interface StructureChartProps {
  data?: ResourceBreakdownItem[]; // Nhận dữ liệu breakdown từ cha
  isLoading: boolean;
}

export const StructureChart = ({ data = [], isLoading }: StructureChartProps) => {

  // Transform dữ liệu API thành cấu trúc Chart.js cần
  const chartData = useMemo(() => {
    // Nếu data rỗng thì trả về cấu trúc mặc định để không lỗi
    if (!data || data.length === 0) return { labels: [], datasets: [] };

    return {
      labels: data.map(item => item.name), // Tên loại hồ sơ
      datasets: [
        {
          data: data.map(item => item.count), // Số lượng file
          backgroundColor: COLORS, // Tự động map màu
          borderWidth: 0,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          font: { size: 11, family: "'Inter', sans-serif" },
          padding: 15,
          boxWidth: 8,
        },
      },
      tooltip: {
        callbacks: {
            // Format tooltip: "Hồ sơ nhân sự: 4"
            label: function(context: any) {
                const label = context.label || '';
                const value = context.raw || 0;
                return ` ${label}: ${value} file`;
            }
        }
      }
    },
    cutout: '70%', // Độ rỗng giữa biểu đồ
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-full flex flex-col">
      <h3 className="font-semibold text-slate-800 mb-4">Cơ cấu tài liệu</h3>
      
      <div className="flex-1 min-h-[250px] flex items-center justify-center relative">
        {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-blue-500">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        ) : data.length === 0 ? (
            <div className="text-center text-slate-400 flex flex-col items-center">
                <PieChart className="w-10 h-10 mb-2 opacity-20" />
                <span className="text-xs">Chưa có dữ liệu phân loại</span>
            </div>
        ) : (
            <Doughnut data={chartData} options={options} />
        )}
      </div>
      
      {!isLoading && data.length > 0 && (
         <p className="text-xs text-center text-slate-400 mt-4 italic">
           *Dữ liệu thực tế từ kho lưu trữ
         </p>
      )}
    </div>
  );
};