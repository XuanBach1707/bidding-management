// activity-chart.tsx
"use client";

import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils"; // Import cn để xử lý class động

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const ActivityChart = () => {
  // [UPDATE] Dùng useMemo để tránh re-render chart không cần thiết
  const data = useMemo(() => ({
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Tệp tải lên',
        data: [40, 65, 30, 80, 55, 90, 45, 60, 75, 50, 85, 95],
        backgroundColor: '#009d98',
        hoverBackgroundColor: '#007a76',
        borderRadius: 4,
        // [UPDATE] Responsive Bar Thickness
        // Mobile: Tự động co giãn (không set cứng). Desktop: max 20px
        maxBarThickness: 20, 
        categoryPercentage: 0.8, // Độ rộng cột so với khoảng trống
      },
    ],
  }), []);

  const options: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false, // Quan trọng để fill container
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
          tickLength: 0, // Bỏ gạch thừa ở trục Y
        },
        border: { display: false }, // Bỏ đường kẻ trục Y
        ticks: { font: { size: 11 }, color: '#64748b', padding: 8 }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 10 }, color: '#64748b' } // Font nhỏ hơn chút cho mobile
      },
    },
  }), []);

  return (
    // [UPDATE] p-4 trên mobile, p-6 trên desktop
    <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 md:mb-6">
         <h3 className="font-bold text-slate-800 text-xs md:text-sm uppercase tracking-wide truncate mr-2">
            Tần suất tải lên
         </h3>
         
         <Select defaultValue="2025">
            <SelectTrigger className="w-[80px] md:w-[90px] h-8 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
         </Select>
      </div>
      
      {/* Chart Container */}
      <div className="flex-1 w-full min-h-[200px] relative">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};