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
            if (route.children && route.children.length === 0 && !route.href) return false;
            return true;
        });
    };

    return filterFn(sidebarRoutes);
  }, [userRole]);

  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-white shadow-sm">

      {/* HEADER / LOGO - ĐÃ SỬA: Không dùng Link, Logo to hơn */}
      <div className="flex h-20 items-center border-b px-4 shrink-0 bg-white"> {/* Tăng chiều cao header lên h-20 */}
        <div className="flex items-center gap-4 w-full"> {/* Tăng khoảng cách gap lên 4 */}
           {/* Logo Ảnh */}
           <div className="relative h-12 w-12 shrink-0"> {/* Tăng kích thước ảnh lên h-12 w-12 */}
             <Image
               src="/PC1_Logo.svg" // Đã đổi thành .svg
               alt="PC1 Group Logo"
               fill
               className="object-contain"
               priority
             />
           </div>

           {/* Tên Hệ thống */}
           <div className="flex flex-col justify-center">
              <span className="text-base font-extrabold text-slate-900 leading-tight"> {/* Tăng cỡ chữ lên text-base */}
                PC1 GROUP
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5"> {/* Tăng cỡ chữ phụ lên text-[11px] */}
                Bidding Hub
              </span>
           </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 custom-scrollbar">
        {filteredMenu.length > 0 ? (
            filteredMenu.map((route, index) => (
               <SidebarItem key={index} route={route} />
            ))
        ) : (
            <div className="space-y-3 p-2">
                <div className="h-8 bg-slate-100 rounded animate-pulse" />
                <div className="h-8 bg-slate-100 rounded animate-pulse" />
                <div className="h-8 bg-slate-100 rounded animate-pulse" />
            </div>
        )}
      </div>

      {/* FOOTER USER NAV */}
      <div className="p-3 bg-slate-50 border-t shrink-0">
         <SidebarUserItem />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB COMPONENT: SIDEBAR ITEM (Giữ nguyên không thay đổi)
// ----------------------------------------------------------------------
function SidebarItem({ route }: { route: SidebarRoute }) {
  // ... (Code phần này giữ nguyên như cũ)
  const pathname = usePathname() || "";
  const [isOpen, setIsOpen] = useState(false);

  const isActive = route.href 
    ? (pathname === route.href || pathname.startsWith(`${route.href}/`)) 
    : false;
  
  const hasActiveChild = route.children?.some(
    (child) => child.href && pathname.startsWith(child.href)
  );

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  const Icon = route.icon;

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