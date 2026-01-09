"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Calendar, ChevronDown, User } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { http } from "@/shared/api";

// Import Widgets từ module vừa tạo
import { 
  StatsOverview, 
  DeadlineAlertsWidget, 
  DailyTasksWidget, 
  QuickAccessWidget 
} from "@/widgets/engineer-dashboard";

// [ĐÃ SỬA]: Chuyển từ 'export default function' sang 'export const'
export const EngineerDashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const currentDate = format(new Date(), "dd 'Tháng' MM, yyyy", { locale: vi });

  // Lấy thông tin User cho Header
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res: any = await http.get("/auth/me");
        setUser(res?.data);
      } catch (e) { 
        console.error("Lỗi lấy thông tin user:", e); 
      }
    };
    fetchMe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Title & Welcome */}
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="text-[#009d98] w-6 h-6" />
              Dashboard Cá Nhân
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 mt-0.5 font-medium">
              Xin chào, <span className="font-bold text-slate-800">{user?.fullName || "..."}</span> 👋. Chúc bạn một ngày làm việc hiệu quả!
            </p>
          </div>

          {/* Right: Date & Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-[#009d98]" />
              <span className="uppercase tracking-wide">{currentDate}</span>
            </div>
            
            <div className="relative cursor-pointer group pl-4 border-l border-slate-100">
              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-slate-800">{user?.fullName || "Loading..."}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{user?.role || "Nhân viên"}</p>
                </div>
                
                <div className="w-9 h-9 bg-[#009d98]/10 rounded-full flex items-center justify-center text-[#009d98] font-bold shadow-sm border border-[#009d98]/20 transition-all group-hover:bg-[#009d98] group-hover:text-white">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block group-hover:text-[#009d98] transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* 1. KPI Stats */}
        <StatsOverview />

        {/* 2. Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <DeadlineAlertsWidget />
          </div>

          {/* Center Column (6 cols) */}
          <div className="lg:col-span-6 h-full">
            <DailyTasksWidget />
          </div>

          {/* Right Column (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <QuickAccessWidget />
          </div>

        </div>
      </main>
    </div>
  );
};