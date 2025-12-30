// File: src/02_pages/dashboard/ui/widgets.tsx
import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { 
  Trophy, DollarSign, MapPin, PieChart as PieIcon, Activity, List,
  Briefcase, AlertCircle, TrendingUp, TrendingDown 
} from "lucide-react";

// --- DỮ LIỆU MOCK (Dùng chung) ---
const REVENUE_DATA = [
  { name: "T1", won: 400, lost: 240 }, { name: "T2", won: 300, lost: 139 },
  { name: "T3", won: 200, lost: 980 }, { name: "T4", won: 278, lost: 390 },
  { name: "T5", won: 189, lost: 480 }, { name: "T6", won: 239, lost: 380 },
  { name: "T7", won: 349, lost: 430 },
];
const LOCATION_DATA = [
  { name: "Hà Nội", value: 1250, count: 15 }, { name: "TP. HCM", value: 980, count: 12 },
  { name: "Quảng Ninh", value: 650, count: 8 }, { name: "Hải Phòng", value: 450, count: 6 },
  { name: "Đà Nẵng", value: 320, count: 5 },
];
const FAILURE_REASONS_DATA = [
  { name: "Giá dự thầu cao", value: 45, color: "#ef4444" },
  { name: "Hồ sơ năng lực yếu", value: 25, color: "#f97316" },
  { name: "Lỗi kỹ thuật HSDT", value: 15, color: "#eab308" },
  { name: "Thiếu nhân sự", value: 10, color: "#3b82f6" },
  { name: "Khác", value: 5, color: "#94a3b8" },
];
const TOP_OPPORTUNITIES = [
  { id: 1, name: "Xây lắp đường dây 500kV mạch 3", investor: "EVN NPT", score: 98, value: "150 Tỷ", deadline: "2 ngày" },
  { id: 2, name: "Trạm biến áp 220kV Lào Cai", investor: "Ban QLDA Điện 1", score: 92, value: "45 Tỷ", deadline: "5 ngày" },
  { id: 3, name: "Điện nhẹ Viettel Tower", investor: "Viettel Group", score: 89, value: "12 Tỷ", deadline: "3 ngày" },
];

// --- CÁC WIDGET CON ---

// 1. Widget Doanh thu (Bar Chart)
export const RevenueWidget = () => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} tỷ`} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
        <Legend />
        <Bar dataKey="won" name="Trúng thầu" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={30} />
        <Bar dataKey="lost" name="Trượt/Hủy" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// 2. Widget Địa phương (Bar Chart Horizontal)
export const LocationWidget = () => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={LOCATION_DATA} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" stroke="#475569" fontSize={13} tickLine={false} axisLine={false} width={100} />
        <Tooltip cursor={{ fill: 'transparent' }} />
        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// 3. Widget Nguyên nhân thất bại (Pie Chart)
export const FailureReasonWidget = () => (
  <div className="h-[250px] w-full relative">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={FAILURE_REASONS_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {FAILURE_REASONS_DATA.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip />
        <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-[75%] -translate-y-1/2 text-center pointer-events-none">
      <span className="text-xl font-bold text-slate-900"></span>
      <p className="text-[10px] text-slate-500"></p>
    </div>
  </div>
);

// 4. Widget Danh sách Cơ hội (List)
export const TopOpportunitiesWidget = () => (
  <div className="space-y-3">
    {TOP_OPPORTUNITIES.map((item) => (
      <div key={item.id} className="flex flex-col gap-2 p-3 bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              CĐT: <span className="font-medium">{item.investor}</span> • Giá trị: <span className="font-medium text-slate-700">{item.value}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full whitespace-nowrap">{item.deadline}</span>
            <div className="text-lg font-black text-green-600 leading-none">{item.score}</div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// 5. Widget Tỷ lệ hoàn vốn (Line Chart)
export const RoiWidget = () => (
  <div className="h-[200px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={REVENUE_DATA}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
        <YAxis fontSize={12} axisLine={false} tickLine={false} />
        <Tooltip />
        <Line type="monotone" dataKey="won" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// 6. WIDGET MỚI: THỐNG KÊ TỔNG QUAN (ĐÃ SỬA STYLE)
export const SummaryStatsWidget = () => {
  const stats = [
    { 
      label: "Tổng giá trị trúng thầu (YTD)", 
      value: "2,450 Tỷ", 
      trend: "+12.5%", 
      trendUp: true, 
      desc: "so với tháng trước",
      icon: DollarSign, 
      color: "bg-green-100 text-green-600",
      valueColor: "text-slate-900"
    },
    { 
      label: "Tỷ lệ thắng thầu", 
      value: "32.8%", 
      trend: "+4.1%", 
      trendUp: true, 
      desc: "so với tháng trước",
      icon: Trophy, 
      color: "bg-blue-100 text-blue-600",
      valueColor: "text-slate-900"
    },
    { 
      label: "Gói thầu đang theo đuổi", 
      value: "18", 
      trend: "-2", 
      trendUp: false, 
      desc: "so với tháng trước",
      icon: Briefcase, 
      color: "bg-purple-100 text-purple-600",
      valueColor: "text-slate-900"
    },
    { 
      label: "Cảnh báo / Quá hạn", 
      value: "5", 
      trend: "+2", 
      trendUp: false, 
      inverseTrend: true,
      desc: "so với tháng trước",
      icon: AlertCircle, 
      color: "bg-red-100 text-red-600",
      valueColor: "text-slate-900"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      {stats.map((item, index) => (
        // Đã sửa: bg-white, border-slate-200, shadow-sm để giống Card chuẩn
        <div key={index} className="flex flex-col justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-slate-600">{item.label}</span>
            <div className={`p-2 rounded-full ${item.color}`}>
              <item.icon size={18} />
            </div>
          </div>
          
          <div>
            <div className={`text-2xl font-bold ${item.valueColor} mb-1`}>{item.value}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`flex items-center gap-0.5 font-bold ${
                (item.trendUp && !item.inverseTrend) || (!item.trendUp && item.inverseTrend) 
                  ? "text-green-600" 
                  : "text-red-500"
              }`}>
                {item.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {item.trend}
              </span>
              <span className="text-slate-400">{item.desc}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};