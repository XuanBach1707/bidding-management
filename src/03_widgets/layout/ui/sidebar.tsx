"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu } from "lucide-react"; // Thêm icon Menu

import { cn } from "@/shared/lib/utils";
import { sidebarRoutes, SidebarRoute } from "../config/sidebar-routes";
import { useAuth } from "@/features/auth/model/auth-context";
import { SidebarUserItem } from "./user-nav";

// Import các thành phần Sheet của Shadcn UI
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle, // Accessibility requirement
  SheetDescription, // Accessibility requirement
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button"; // Dùng Button cho trigger

// =========================================================================
// 1. SIDEBAR CONTENT (REUSABLE COMPONENT)
// Logic chính nằm ở đây để dùng chung cho cả Mobile và Desktop
// =========================================================================

interface SidebarContentProps {
  onLinkClick?: () => void; // Callback để đóng menu mobile khi click link
}

function SidebarContent({ onLinkClick }: SidebarContentProps) {
  const { user } = useAuth();
  const userRole = user?.role || null;

  // Logic lọc menu (giữ nguyên logic của bạn)
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
    <div className="flex h-full w-full flex-col bg-white">
      {/* HEADER / LOGO */}
      <div className="flex h-20 items-center px-6 shrink-0 border-b border-slate-100/50">
        <Link href="/" className="flex items-center gap-3 w-full" onClick={onLinkClick}>
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src="/PC1_Logo.svg"
              alt="PC1 Group Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[15px] font-extrabold text-slate-800 leading-none tracking-tight">
              PC1 GROUP
            </span>
            <span className="text-[10px] font-bold text-[#009d98] uppercase tracking-[0.15em] mt-1">
              Bidding Hub
            </span>
          </div>
        </Link>
      </div>

      {/* MENU LIST */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        {filteredMenu.length > 0 ? (
          filteredMenu.map((route, index) => (
            <SidebarItem key={index} route={route} onLinkClick={onLinkClick} />
          ))
        ) : (
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

// =========================================================================
// 2. SIDEBAR ITEM (SUB COMPONENT)
// =========================================================================

function SidebarItem({ 
  route, 
  onLinkClick 
}: { 
  route: SidebarRoute; 
  onLinkClick?: () => void 
}) {
  const pathname = usePathname() || "";
  const [isOpen, setIsOpen] = useState(false);

  const isActive = route.href
    ? (pathname === route.href || pathname.startsWith(`${route.href}/`))
    : false;

  const hasActiveChild = route.children?.some((child) =>
    child.href && pathname.startsWith(child.href)
  );

  useEffect(() => {
    if (hasActiveChild) setIsOpen(true);
  }, [hasActiveChild]);

  const Icon = route.icon;

  // -- PARENT ITEM --
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
          {hasActiveChild && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[4px] bg-[#009d98] rounded-r-md" />
          )}
          <div className="flex items-center gap-3 ml-1">
            {Icon && (
              <Icon className={cn("h-[18px] w-[18px]", hasActiveChild ? "text-[#009d98]" : "text-slate-400 group-hover:text-slate-600")} />
            )}
            <span>{route.title}</span>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
        </button>

        {isOpen && (
          <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-200 pl-2">
            {route.children.map((child, idx) => (
              // Truyền tiếp onLinkClick cho con
              <SidebarItem key={idx} route={child} onLinkClick={onLinkClick} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // -- SINGLE LINK ITEM --
  return (
    <Link
      href={route.href || "#"}
      onClick={onLinkClick} // Quan trọng: Đóng sheet khi click link
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-0.5",
        isActive
          ? "bg-[#009d98]/10 text-[#009d98] font-bold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#009d98] rounded-r-md" />
      )}
      <div className={cn("flex items-center gap-3", isActive && "ml-1")}>
        {Icon && (
          <Icon className={cn("h-[18px] w-[18px] transition-colors", isActive ? "text-[#009d98]" : "text-slate-400 group-hover:text-slate-600")} />
        )}
        <span>{route.title}</span>
      </div>
    </Link>
  );
}

// =========================================================================
// 3. MAIN EXPORTS (DESKTOP & MOBILE)
// =========================================================================

// Component cho DESKTOP: Ẩn trên mobile (hidden), hiện trên desktop (md:flex)
export function Sidebar() {
  return (
    <div className="hidden md:flex h-full w-[260px] flex-col border-r border-slate-200 bg-white shadow-[2px_0_20px_rgba(0,0,0,0.02)]">
      <SidebarContent />
    </div>
  );
}

// Component cho MOBILE: Chỉ hiện nút Trigger trên mobile, ẩn trên desktop
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  // Quan trọng: Chỉ render component này trên client để tránh hydration error
  // (hoặc dùng 'md:hidden' ở parent)
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6 text-slate-700" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      
      {/* side="left" để menu trượt từ trái sang giống Sidebar */}
      <SheetContent side="left" className="p-0 w-[280px] border-r-0"> 
        {/* Thêm Title/Description ẩn để đáp ứng Accessibility của Radix UI/Shadcn */}
        <SheetTitle className="hidden">Menu điều hướng</SheetTitle>
        <SheetDescription className="hidden">Sidebar menu cho mobile</SheetDescription>
        
        {/* Truyền hàm đóng menu khi click link */}
        <SidebarContent onLinkClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}