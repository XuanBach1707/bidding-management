"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Calendar, ChevronDown } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50">
      
      {/* --- HEADER SECTION --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Title & Welcome */}
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="text-blue-600 w-6 h-6" />
              Dashboard Cá Nhân
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
              Xin chào, <span className="font-bold text-slate-700">{user?.fullName || "..."}</span> 👋. Chúc bạn một ngày làm việc hiệu quả!
            </p>
          </div>

          {/* Right: Date & Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-600 border border-slate-200">
              <Calendar className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
            
            <div className="relative cursor-pointer group">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-semibold text-slate-700">{user?.fullName || "Loading..."}</p>
                  <p className="text-xs text-slate-500">{user?.role || "Nhân viên"}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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