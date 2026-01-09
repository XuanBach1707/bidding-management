"use client";

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const ActivityChart = () => {
  const data = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Tệp tải lên',
        data: [40, 65, 30, 80, 55, 90, 45, 60, 75, 50, 85, 95],
        backgroundColor: '#009d98', // [PC1 BRAND COLOR]
        hoverBackgroundColor: '#007a76',
        borderRadius: 4,
        barThickness: 20, // Làm cột mảnh hơn cho tinh tế
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b', // Slate-800
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
          color: '#f1f5f9', // Slate-100
          borderDash: [4, 4],
        } as any, 
        ticks: { font: { size: 11 }, color: '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#64748b' }
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
         <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Tần suất tải lên</h3>
         {/* Dropdown giả lập chọn năm */}
         <Select defaultValue="2025">
            <SelectTrigger className="w-[90px] h-8 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
         </Select>
      </div>
      <div className="flex-1 w-full min-h-[250px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};