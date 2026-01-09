"use client";

import Link from "next/link";
import { MoreVertical, LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/shared/ui/dropdown-menu";
import { useAuth } from "@/features/auth/model/auth-context"; 
import { Skeleton } from "@/shared/ui/skeleton";

export const SidebarUserItem = () => {
  const { user, isLoading, logout } = useAuth();

  // Skeleton Loading
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-2">
         <Skeleton className="h-9 w-9 rounded-full shrink-0" />
         <div className="space-y-1.5 flex-1 overflow-hidden">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-full" />
         </div>
      </div>
    );
  }

  if (!user) return null;

  // Lấy URL ảnh (đảm bảo fallback về undefined nếu null/rỗng để hiện AvatarFallback)
  const avatarSrc = user.avatarUrl || undefined;

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 cursor-pointer transition-all w-full group">
            
            {/* AVATAR */}
            <Avatar className="h-9 w-9 border border-slate-200 shrink-0">
              {/* SỬA Ở ĐÂY: Truyền avatarSrc vào */}
              <AvatarImage 
                src={avatarSrc} 
                alt={user.fullName} 
                className="object-cover" // Thêm class này để ảnh không bị méo nếu không vuông
              /> 
              <AvatarFallback className="bg-[#009d98]/10 text-[#009d98] font-extrabold text-xs">
                {user.fullName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate group-hover:text-[#009d98] transition-colors">
                {user.fullName}
              </p>
              <p className="text-[11px] text-slate-500 truncate" title={user.email}>
                {user.email}
              </p>
            </div>
            
            <MoreVertical className="h-4 w-4 text-slate-400 group-hover:text-[#009d98] shrink-0" />
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-60 mb-2 ml-2" align="start" side="right" sideOffset={10}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-[#009d98]">{user.fullName}</p>
              <p className="text-xs leading-none text-slate-500 truncate">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <Link href="/profile" className="w-full">
              <DropdownMenuItem className="cursor-pointer focus:bg-[#009d98]/5 focus:text-[#009d98]">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-700 cursor-pointer focus:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};