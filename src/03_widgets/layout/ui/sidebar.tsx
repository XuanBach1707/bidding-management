"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { sidebarRoutes, SidebarRoute } from "../config/sidebar-routes";
import { useAuth } from "@/features/auth/model/auth-context"; // [MỚI] Dùng hook Auth
import { SidebarUserItem } from "./user-nav"; // [MỚI] Import cục User

export function Sidebar() {
  // [MỚI] Lấy userRole từ Auth Context thay vì tự parse localStorage
  const { user } = useAuth();
  const userRole = user?.role || null;

  // Hàm lọc menu đệ quy dựa trên role
  const filteredMenu = useMemo(() => {
    if (!userRole) return [];

    const filterFn = (routes: SidebarRoute[]): SidebarRoute[] => {
      return routes
        .filter((route) => {
          if (!route.roles) return true;
          // route.roles chứa danh sách role được phép
          // userRole (đã được Zod validate) phải nằm trong danh sách đó
          return route.roles.includes(userRole);
        })
        .map((route) => ({
          ...route,
          children: route.children ? filterFn(route.children) : undefined,
        }))
        // Loại bỏ các mục cha nếu các mục con bị lọc hết (đối với nhóm menu)
        .filter((route) => {
            if (route.children && route.children.length === 0 && !route.href) return false;
            return true;
        });
    };

    return filterFn(sidebarRoutes);
  }, [userRole]);

  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-white shadow-sm">
      {/* Header / Logo */}
      <div className="flex h-16 items-center border-b px-6 shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">DT</div>
           <span className="text-lg font-bold text-slate-800">Đấu Thầu Pro</span>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 custom-scrollbar">
        {filteredMenu.length > 0 ? (
            filteredMenu.map((route, index) => (
               <SidebarItem key={index} route={route} />
            ))
        ) : (
            // Skeleton loader khi chưa load xong role hoặc không có quyền
            <div className="space-y-3 p-2">
                <div className="h-8 bg-slate-100 rounded animate-pulse" />
                <div className="h-8 bg-slate-100 rounded animate-pulse" />
                <div className="h-8 bg-slate-100 rounded animate-pulse" />
            </div>
        )}
      </div>

      {/* [MỚI] FOOTER USER NAV - Luôn nằm đáy */}
      <div className="p-3 bg-slate-50 border-t shrink-0">
         <SidebarUserItem />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB COMPONENT: SIDEBAR ITEM (Giữ nguyên logic cũ của bạn)
// ----------------------------------------------------------------------

function SidebarItem({ route }: { route: SidebarRoute }) {
  const pathname = usePathname() || "";
  const [isOpen, setIsOpen] = useState(false);

  const isActive = route.href 
    ? (pathname === route.href || pathname.startsWith(`${route.href}/`)) 
    : false;
  
  // Logic tự mở nếu con đang active
  const hasActiveChild = route.children?.some(
    (child) => child.href && pathname.startsWith(child.href)
  );

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  const Icon = route.icon;

  // Render Parent Menu (Có con)
  if (route.children && route.children.length > 0) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900",
            hasActiveChild ? "text-indigo-600 font-semibold bg-indigo-50/50" : "text-slate-600"
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon className={cn("h-5 w-5", hasActiveChild ? "text-indigo-600" : "text-slate-400")} />
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
          <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-2">
            {route.children.map((child, idx) => (
              <SidebarItem key={idx} route={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Leaf Menu (Không con)
  return (
    <Link
      href={route.href || "#"}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-0.5",
        isActive
          ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm border border-indigo-100"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {Icon && (
        <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
      )}
      <span>{route.title}</span>
    </Link>
  );
}