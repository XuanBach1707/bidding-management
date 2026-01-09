import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from "recharts";
import { 
  Trophy, DollarSign, Briefcase, AlertCircle, 
  TrendingUp, TrendingDown, Clock, ArrowRight 
} from "lucide-react";
import { Badge } from "@/shared/ui/badge"; // Dùng Badge của Shadcn
import { cn } from "@/shared/lib/utils";

// --- DỮ LIỆU MOCK (Giữ nguyên) ---
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
  { name: "Giá cao", value: 45, color: "#ef4444" }, // Red
  { name: "HSNL yếu", value: 25, color: "#f97316" }, // Orange
  { name: "Lỗi HSDT", value: 15, color: "#eab308" }, // Yellow
  { name: "Nhân sự", value: 10, color: "#009d98" }, // Teal (Thay cho Blue)
  { name: "Khác", value: 5, color: "#94a3b8" },    // Slate
];
const TOP_OPPORTUNITIES = [
  { id: 1, name: "Xây lắp đường dây 500kV mạch 3 - Đoạn qua Thanh Hóa", investor: "EVN NPT", score: 98, value: "150 Tỷ", deadline: "2 ngày", status: "high" },
  { id: 2, name: "Trạm biến áp 220kV Lào Cai (Mở rộng)", investor: "Ban QLDA Điện 1", score: 92, value: "45 Tỷ", deadline: "5 ngày", status: "medium" },
  { id: 3, name: "Hệ thống điện nhẹ Viettel Tower", investor: "Viettel Group", score: 89, value: "12 Tỷ", deadline: "3 ngày", status: "medium" },
];

// --- UTILS: CUSTOM TOOLTIP (Chuẩn Shadcn) ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg outline-none">
        <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 font-medium">{entry.name}:</span>
            {/* tabular-nums: Giúp số thẳng hàng, dễ so sánh */}
            <span className="text-slate-900 font-bold tabular-nums">
              {entry.value.toLocaleString()} {entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- CÁC WIDGET CON ---

// 1. Widget Doanh thu (Màu Teal chủ đạo)
export const RevenueWidget = () => (
  <div className="h-[300px] w-full mt-2">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        {/* Lưới mờ đi để đỡ rối */}
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}/>
        {/* Màu PC1 Teal cho trúng thầu, Xám cho trượt */}
        <Bar dataKey="won" name="Trúng thầu" fill="#009d98" radius={[4, 4, 0, 0]} barSize={24} unit=" Tỷ" />
        <Bar dataKey="lost" name="Trượt/Hủy" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={24} unit=" Tỷ" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// 2. Widget Địa phương (Clean hơn)
export const LocationWidget = () => (
  <div className="h-[300px] w-full mt-2">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={LOCATION_DATA} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        {/* Dùng màu Teal nhạt hơn một chút hoặc giữ Teal đậm */}
        <Bar dataKey="value" name="Giá trị" fill="#009d98" radius={[0, 4, 4, 0]} barSize={24} unit=" Tỷ" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// 3. Widget Nguyên nhân thất bại (Donut Chart hiện đại)
export const FailureReasonWidget = () => (
  <div className="h-[250px] w-full relative">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie 
          data={FAILURE_REASONS_DATA} 
          cx="50%" cy="50%" 
          innerRadius={60} outerRadius={80} 
          paddingAngle={4} 
          dataKey="value"
          stroke="none" // Bỏ viền trắng cắt giữa các miếng
        >
          {FAILURE_REASONS_DATA.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
      </PieChart>
    </ResponsiveContainer>
    {/* Center Text: Tạo điểm nhấn */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-[75%] -translate-y-1/2 text-center pointer-events-none">
      <span className="text-2xl font-extrabold text-slate-800 tabular-nums">100</span>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gói thầu</p>
    </div>
  </div>
);

// 4. Widget Danh sách Cơ hội (Table-like View)
export const TopOpportunitiesWidget = () => (
  <div className="flex flex-col h-full">
    {/* Header giả lập bảng */}
    <div className="flex text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 border-b border-slate-100 mb-2">
      <div className="flex-1">Gói thầu / Chủ đầu tư</div>
      <div className="w-24 text-right">Giá trị</div>
      <div className="w-20 text-right">AI Score</div>
    </div>
    
    <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar max-h-[250px]">
      {TOP_OPPORTUNITIES.map((item) => (
        <div key={item.id} className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:border-[#009d98]/30 hover:shadow-sm hover:bg-[#009d98]/5 transition-all cursor-pointer">
          <div className="flex-1 min-w-0 pr-4">
             <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-700 text-sm truncate group-hover:text-[#009d98] transition-colors">{item.name}</h4>
                {item.deadline === "2 ngày" && (
                   <Badge variant="destructive" className="h-5 px-1.5 text-[10px] rounded-sm uppercase">Gấp</Badge>
                )}
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-500">
               <Briefcase size={12} />
               <span className="truncate max-w-[150px]">{item.investor}</span>
               <span className="text-slate-300">|</span>
               <Clock size={12} />
               <span>Còn {item.deadline}</span>
             </div>
          </div>

          <div className="w-24 text-right">
             <span className="text-sm font-bold text-slate-800 tabular-nums">{item.value}</span>
          </div>

          <div className="w-20 flex justify-end">
             {/* Score Badge */}
             <div className={cn(
               "flex items-center justify-center w-10 h-8 rounded font-black text-sm tabular-nums",
               item.score >= 90 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
             )}>
                {item.score}
             </div>
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-auto pt-2 text-right">
       <button className="text-xs font-bold text-[#009d98] flex items-center justify-end gap-1 hover:underline">
          Xem tất cả <ArrowRight size={12} />
       </button>
    </div>
  </div>
);

// 5. Widget ROI (Area Chart thay vì Line để nhìn "đầm" hơn)
export const RoiWidget = () => (
  <div className="h-[200px] w-full mt-2">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#009d98" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#009d98" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} stroke="#94a3b8" />
        <YAxis fontSize={11} axisLine={false} tickLine={false} stroke="#94a3b8" />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="won" name="ROI" stroke="#009d98" strokeWidth={2} fillOpacity={1} fill="url(#colorWon)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// 6. SUMMARY STATS (KPI Header) - Thiết kế lại để "Soi số"
export const SummaryStatsWidget = () => {
  const stats = [
    { 
      label: "Giá trị trúng thầu (YTD)", 
      value: "2,450", 
      unit: "Tỷ",
      trend: "+12.5%", 
      trendUp: true, 
      desc: "tháng trước",
      icon: DollarSign, 
      color: "bg-[#009d98]/10 text-[#009d98]", // Teal background
    },
    { 
      label: "Tỷ lệ thắng thầu", 
      value: "32.8", 
      unit: "%",
      trend: "+4.1%", 
      trendUp: true, 
      desc: "tháng trước",
      icon: Trophy, 
      color: "bg-blue-50 text-blue-600",
    },
    { 
      label: "Đang theo đuổi", 
      value: "18", 
      unit: "Gói",
      trend: "-2", 
      trendUp: false, 
      desc: "tháng trước",
      icon: Briefcase, 
      color: "bg-purple-50 text-purple-600",
    },
    { 
      label: "Cảnh báo rủi ro", 
      value: "5", 
      unit: "Gói",
      trend: "+2", 
      trendUp: false, 
      inverseTrend: true, // Tăng là xấu
      desc: "tháng trước",
      icon: AlertCircle, 
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
      {stats.map((item, index) => (
        <div key={index} className="flex flex-col justify-between p-5 rounded-xl bg-white border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:border-[#009d98]/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
            <div className={`p-2 rounded-lg ${item.color}`}>
              <item.icon size={18} />
            </div>
          </div>
          
          <div>
            <div className="flex items-baseline gap-1 mb-1">
                {/* tabular-nums: Quan trọng để so sánh các số giữa các card */}
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight tabular-nums">{item.value}</span>
                <span className="text-sm font-semibold text-slate-500">{item.unit}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className={`flex items-center ${
                (item.trendUp && !item.inverseTrend) || (!item.trendUp && item.inverseTrend) 
                  ? "text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded" 
                  : "text-red-600 bg-red-50 px-1.5 py-0.5 rounded"
              }`}>
                {item.trendUp ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {item.trend}
              </span>
              <span className="text-slate-400">vs {item.desc}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};