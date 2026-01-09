"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { sidebarRoutes, SidebarRoute } from "../config/sidebar-routes";
import { useAuth } from "@/features/auth/model/auth-context";
import { SidebarUserItem } from "./user-nav";

export function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.role || null;

  // Logic lọc menu theo quyền hạn
  const filteredMenu = useMemo(() => {
    if (!userRole) return [];

    const filterFn = (routes: SidebarRoute[]): SidebarRoute[] => {
      return routes
        .filter((route) => {
          if (!route.roles) return true;
          return route.roles.includes(userRole);
        })
        .map((route) => ({
          ...route,
          children: route.children ? filterFn(route.children) : undefined,
        }))
        .filter((route) => {
            // Loại bỏ mục cha nếu không còn con nào và cũng không có link
            if (route.children && route.children.length === 0 && !route.href) return false;
            return true;
        });
    };

    return filterFn(sidebarRoutes);
  }, [userRole]);

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-slate-200 bg-white shadow-[2px_0_20px_rgba(0,0,0,0.02)]">

      {/* HEADER / LOGO: Sạch sẽ, chuyên nghiệp */}
      <div className="flex h-20 items-center px-6 shrink-0 bg-white border-b border-slate-100/50">
        <div className="flex items-center gap-3 w-full">
           {/* Logo Ảnh */}
           <div className="relative h-10 w-10 shrink-0">
             <Image
               src="/PC1_Logo.svg"
               alt="PC1 Group Logo"
               fill
               className="object-contain"
               priority
             />
           </div>

           {/* Tên Hệ thống */}
           <div className="flex flex-col justify-center">
              <span className="text-[15px] font-extrabold text-slate-800 leading-none tracking-tight">
                PC1 GROUP
              </span>
              <span className="text-[10px] font-bold text-[#009d98] uppercase tracking-[0.15em] mt-1">
                Bidding Hub
              </span>
           </div>
        </div>
      </div>

      {/* MENU LIST */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        {filteredMenu.length > 0 ? (
            filteredMenu.map((route, index) => (
               <SidebarItem key={index} route={route} />
            ))
        ) : (
            // Skeleton Loading khi chưa có menu
            <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 bg-slate-50 rounded animate-pulse" />
                ))}
            </div>
        )}
      </div>

      {/* FOOTER USER NAV */}
      <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
         <SidebarUserItem />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB COMPONENT: SIDEBAR ITEM
// ----------------------------------------------------------------------
function SidebarItem({ route }: { route: SidebarRoute }) {
  const pathname = usePathname() || "";
  const [isOpen, setIsOpen] = useState(false);

  // Logic Active
  const isActive = route.href 
    ? (pathname === route.href || pathname.startsWith(`${route.href}/`)) 
    : false;
  
  const hasActiveChild = route.children?.some(
    (child) => child.href && pathname.startsWith(child.href)
  );

  useEffect(() => {
    if (hasActiveChild) setIsOpen(true);
  }, [hasActiveChild]);

  const Icon = route.icon;

  // --- TRƯỜNG HỢP 1: MENU CÓ CON (PARENT) ---
  if (route.children && route.children.length > 0) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group relative flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
            hasActiveChild 
              ? "text-[#009d98] font-bold bg-[#009d98]/5" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          {/* Thanh chỉ thị bên trái cho Parent (khi con đang active) */}
          {hasActiveChild && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[4px] bg-[#009d98] rounded-r-md" />
          )}

          <div className="flex items-center gap-3 ml-1"> {/* Thêm ml-1 để tránh dính vào thanh chỉ thị */}
            {Icon && (
              <Icon className={cn("h-[18px] w-[18px]", hasActiveChild ? "text-[#009d98]" : "text-slate-400 group-hover:text-slate-600")} />
            )}
            <span>{route.title}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {isOpen && (
          <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-200 pl-2">
            {route.children.map((child, idx) => (
              <SidebarItem key={idx} route={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- TRƯỜNG HỢP 2: MENU ĐƠN (LINK) ---
  return (
    <Link
      href={route.href || "#"}
      className={cn(
        // 'relative' để định vị thanh span absolute bên trong
        "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-0.5",
        isActive
          ? "bg-[#009d98]/10 text-[#009d98] font-bold" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {/* THANH CHỈ THỊ (Thay thế border-l) */}
      {/* Nó nằm đè lên, thẳng tắp, không bị cong theo border-radius của nút */}
      {isActive && (
         <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#009d98] rounded-r-md" />
      )}
      
      {/* Content */}
      <div className={cn("flex items-center gap-3", isActive && "ml-1")}> {/* Thêm chút margin khi active để cân đối */}
        {Icon && (
            <Icon className={cn("h-[18px] w-[18px] transition-colors", isActive ? "text-[#009d98]" : "text-slate-400 group-hover:text-slate-600")} />
        )}
        <span>{route.title}</span>
      </div>
    </Link>
  );
}