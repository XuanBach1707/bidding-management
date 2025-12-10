"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { sidebarRoutes, SidebarRoute } from "../config/sidebar-routes";

export function Sidebar() {
  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-white">
      {/* Header / Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-xl font-bold text-primary">Đấu Thầu Pro</span>
      </div>

      {/* Menu List */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {sidebarRoutes.map((route, index) => (
          <SidebarItem key={index} route={route} />
        ))}
      </div>
    </div>
  );
}

// --- COMPONENT CON XỬ LÝ LOGIC ACCORDION ---
function SidebarItem({ route }: { route: SidebarRoute }) {
  const pathname = usePathname() || "";
  const [isOpen, setIsOpen] = useState(false);

  const isActive = route.href ? pathname.startsWith(route.href) : false;
  
  const hasActiveChild = route.children?.some(
    (child) => child.href && pathname.startsWith(child.href)
  );

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  // Lấy Icon ra biến riêng
  const Icon = route.icon;

  // TRƯỜNG HỢP 1: CÓ MENU CON (Accordion)
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
            {/* SỬA LỖI Ở ĐÂY: Chỉ render nếu Icon tồn tại */}
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

  // TRƯỜNG HỢP 2: KHÔNG CÓ MENU CON (Link thường)
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
      {/* SỬA LỖI Ở ĐÂY: Chỉ render nếu Icon tồn tại */}
      {Icon && (
        <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400")} />
      )}
      <span>{route.title}</span>
    </Link>
  );
}