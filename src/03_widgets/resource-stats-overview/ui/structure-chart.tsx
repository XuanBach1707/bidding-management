"use client";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Đăng ký component của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export const StructureChart = () => {
  // [MOCK DATA]: Dữ liệu giả lập cơ cấu tài liệu
  const data = {
    labels: ['Hồ sơ năng lực', 'Hồ sơ pháp lý', 'Tài chính', 'Khác'],
    datasets: [
      {
        data: [35, 25, 20, 20],
        backgroundColor: [
          '#3b82f6', // blue-500
          '#fb923c', // orange-400
          '#a855f7', // purple-500
          '#4ade80', // green-400
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          font: { size: 11, family: "'Inter', sans-serif" },
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-full">
      <h3 className="font-semibold text-slate-800 mb-4">Cơ cấu tài liệu</h3>
      <div className="h-64 flex justify-center">
        <Doughnut data={data} options={options} />
      </div>
      <p className="text-xs text-center text-slate-400 mt-2 italic">
        *Số liệu phân loại giả lập
      </p>
    </div>
  );
};