"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Calendar, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { http } from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import { User } from "@/entities/user";

// Import Widgets
import { 
  StatsOverview, 
  DeadlineAlertsWidget, 
  DailyTasksWidget, 
  QuickAccessWidget 
} from "@/widgets/engineer-dashboard";

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
};

export const EngineerDashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  // [Mobile Optimization] Trên mobile chỉ hiện "19/01/2026" cho ngắn, PC hiện đầy đủ
  const currentDate = format(new Date(), "dd 'Tháng' MM, yyyy", { locale: vi });

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
      {/* Mobile: h-auto py-3. PC: h-16 py-0 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          {/* Left: Title & Welcome */}
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="text-[#009d98] w-5 h-5 md:w-6 md:h-6" />
              Dashboard
            </h1>
            {/* Mobile: Ẩn câu chào dài dòng, chỉ hiện tên nếu cần thiết hoặc ẩn luôn để tiết kiệm chỗ */}
            <p className="hidden sm:block text-xs text-slate-500 mt-0.5 font-medium">
              Xin chào, <span className="font-bold text-slate-800">{user?.fullName || "..."}</span> 👋.
            </p>
          </div>

          {/* Right: Date & Profile */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-[#009d98]" />
              <span className="uppercase tracking-wide">{currentDate}</span>
            </div>
            
            {/* PROFILE SECTION */}
            <div className="flex items-center gap-3 ml-1 md:ml-2">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">
                  {user?.fullName || "..."}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  {user?.jobTitle || user?.role || "Kỹ sư"}
                </p>
              </div>
              
              <div className={cn(
                "w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold shadow-sm border overflow-hidden transition-all",
                "bg-[#009d98]/10 text-[#009d98] border-[#009d98]/20"
              )}>
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.fullName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : user?.fullName ? (
                  <span className="text-sm">{getInitials(user.fullName)}</span>
                ) : (
                  <UserIcon className="w-5 h-5 opacity-50" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      {/* Mobile: px-4 py-4. PC: px-6 py-8 */}
      <main className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* Widget 1: Thống kê tổng quan */}
        <StatsOverview />

        {/* GRID LAYOUT PHỨC TẠP
           Mobile: Dùng Flex Col để sắp xếp lại thứ tự (Tasks lên đầu).
           PC: Dùng Grid 12 cột như cũ.
        */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start mt-6">
          
          {/* CỘT TRÁI (PC: 3) - Deadline */}
          {/* Mobile: Order 2 (Hiện sau Task) */}
          <div className="order-2 lg:order-none lg:col-span-3 space-y-6 w-full">
            <DeadlineAlertsWidget />
          </div>

          {/* CỘT GIỮA (PC: 6) - Daily Tasks */}
          {/* Mobile: Order 1 (Hiện ĐẦU TIÊN - Quan trọng nhất) */}
          <div className="order-1 lg:order-none lg:col-span-6 h-full w-full">
            <DailyTasksWidget />
          </div>

          {/* CỘT PHẢI (PC: 3) - Quick Access */}
          {/* Mobile: Order 3 (Hiện cuối cùng) */}
          <div className="order-3 lg:order-none lg:col-span-3 space-y-6 w-full">
            <QuickAccessWidget />
          </div>
        </div>
      </main>
    </div>
  );
};