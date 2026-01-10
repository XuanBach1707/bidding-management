"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Calendar, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { http } from "@/shared/api";
import { cn } from "@/shared/lib/utils";

// Import Type từ Entity User
import { User } from "@/entities/user";

// Import Widgets
import { 
  StatsOverview, 
  DeadlineAlertsWidget, 
  DailyTasksWidget, 
  QuickAccessWidget 
} from "@/widgets/engineer-dashboard";

/**
 * Helper: Lấy chữ cái đầu của Tên (Ví dụ: "Nguyễn Văn Hùng" -> "H")
 */
const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
};

export const EngineerDashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Title & Welcome */}
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="text-[#009d98] w-6 h-6" />
              Dashboard Cá Nhân
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 mt-0.5 font-medium">
              Xin chào, <span className="font-bold text-slate-800">{user?.fullName || "..."}</span> 👋.
            </p>
          </div>

          {/* Right: Date & Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-[#009d98]" />
              <span className="uppercase tracking-wide">{currentDate}</span>
            </div>
            
            {/* PROFILE SECTION - Đã bỏ ChevronDown và border-l thừa */}
            <div className="flex items-center gap-3 ml-2">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">
                  {user?.fullName || "..."}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  {user?.jobTitle || user?.role || "Kỹ sư"}
                </p>
              </div>
              
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm border overflow-hidden transition-all",
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
      <main className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <StatsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
          <div className="lg:col-span-3 space-y-6">
            <DeadlineAlertsWidget />
          </div>

          <div className="lg:col-span-6 h-full">
            <DailyTasksWidget />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <QuickAccessWidget />
          </div>
        </div>
      </main>
    </div>
  );
};