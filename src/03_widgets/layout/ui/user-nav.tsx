"use client";

import Link from "next/link";
import { MoreVertical, LogOut, Settings, User as UserIcon } from "lucide-react";
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

  // Skeleton khi đang load thông tin
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-2 mt-auto">
         <Skeleton className="h-9 w-9 rounded-full shrink-0" />
         <div className="space-y-1.5 flex-1 overflow-hidden">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-full" />
         </div>
      </div>
    );
  }

  // Không có user -> Không hiện (AuthGuard sẽ lo việc đá ra login, hoặc user đang ở trang public)
  if (!user) return null;

  return (
    <div className="mt-auto pt-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors w-full group">
            {/* Avatar */}
            <Avatar className="h-9 w-9 border border-slate-200 shrink-0">
              <AvatarImage src={undefined} /> 
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">
                {user.fullName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Info Text */}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-slate-900">
                {user.fullName}
              </p>
              <p className="text-xs text-slate-500 truncate group-hover:text-slate-600" title={user.email}>
                {user.email}
              </p>
            </div>
            
            <MoreVertical className="h-4 w-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
          </div>
        </DropdownMenuTrigger>
        
        {/* Dropdown Content - Hiển thị menu bay lên trên hoặc sang phải */}
        <DropdownMenuContent className="w-60 mb-2 ml-2" align="start" side="right" sideOffset={10}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.fullName}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <Link href="/profile" className="w-full">
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};