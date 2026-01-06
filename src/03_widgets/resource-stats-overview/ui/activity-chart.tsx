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

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const ActivityChart = () => {
  // [MOCK DATA]: Tần suất tải lên theo tháng (Dữ liệu giả lập)
  const data = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Số lượng file',
        data: [40, 65, 30, 80, 55, 90, 45, 60, 75, 50, 85, 95],
        backgroundColor: '#2563eb', // blue-600 (Tailwind)
        borderRadius: 4,
      },
    ],
  };

  // [FIX LỖI]: 
  // 1. Thêm type ChartOptions<'bar'> để TS hiểu cấu trúc options
  // 2. Dùng 'as any' ở object grid để bypass lỗi borderDash
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          borderDash: [2, 2], // Tạo nét đứt cho lưới ngang
        } as any, 
      },
      x: {
        grid: { display: false }, // Ẩn lưới dọc
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-full">
      <h3 className="font-semibold text-slate-800 mb-4">Tần suất tải lên (2025)</h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};