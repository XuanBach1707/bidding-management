"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { sidebarRoutes, SidebarRoute } from "../config/sidebar-routes";

export function Sidebar() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userInfoRaw = localStorage.getItem("USER_INFO");
    if (userInfoRaw) {
      try {
        const userInfo = JSON.parse(userInfoRaw);
        setUserRole(userInfo.role);
      } catch (e) {
        console.error("Error parsing USER_INFO", e);
      }
    }
  }, []);

  // Hàm lọc menu đệ quy dựa trên role
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
        // Loại bỏ các mục cha nếu các mục con bị lọc hết (đối với nhóm menu)
        .filter((route) => {
            if (route.children && route.children.length === 0 && !route.href) return false;
            return true;
        });
    };

    return filterFn(sidebarRoutes);
  }, [userRole]);

  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-white">
      {/* Header / Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-xl font-bold text-primary">Đấu Thầu Pro</span>
      </div>

      {/* Menu List */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {filteredMenu.map((route, index) => (
          <SidebarItem key={index} route={route} />
        ))}
      </div>
    </div>
  );
}

function SidebarItem({ route }: { route: SidebarRoute }) {
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
            hasActiveChild ? "text-primary font-semibold" : "text-slate-600"
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon className={cn("h-5 w-5", hasActiveChild ? "text-primary" : "text-slate-400")} />
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
          <div className="ml-4 mt-1 space-y-1 border-l pl-2">
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
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {Icon && (
        <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400")} />
      )}
      <span>{route.title}</span>
    </Link>
  );
}