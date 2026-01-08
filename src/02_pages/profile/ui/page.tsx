"use client";

import React, { useEffect } from "react";
import { 
  LogOut, 
  User as UserIcon, 
  Building2, 
  Briefcase, 
  Mail,
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarDays,
  ShieldCheck,
  KeyRound
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

// Import Auth & Entity
import { useAuth } from "@/features/auth/model/auth-context";
import { UserRole, USER_ROLE_LABELS } from "@/entities/user";

// Import Dialog Đổi mật khẩu
// (Đảm bảo bạn đã tạo file này ở src/features/auth/ui/change-password-dialog.tsx như bước trước)
import { ChangePasswordDialog } from "@/features/auth"; 

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth(); 

  // Gọi API lấy dữ liệu mới nhất (OrgUnit, JobTitle...) ngay khi vào trang
  useEffect(() => {
    refreshUser();
  }, []);

  if (!user) return null; 

  // Lấy tên Role tiếng Việt (hoặc hiển thị mã nếu không tìm thấy)
  const userRoleLabel = USER_ROLE_LABELS[user.role as UserRole] || user.role;
  
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* 1. HEADER: Thông tin chung */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border border-slate-100 shadow-sm">
                <AvatarFallback className="text-xl font-bold bg-indigo-50 text-indigo-600">
                  {user.fullName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-xl font-bold text-slate-900">{user.fullName}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <Mail className="w-3.5 h-3.5" /> {user.email}
                    <span className="text-slate-300">|</span>
                    <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      ID: #{user.userId}
                    </span>
                </div>
            </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={logout}
          className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 gap-2 shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI: THÔNG TIN CÔNG TÁC (Chiếm 2 phần) */}
        <div className="space-y-6 lg:col-span-2">
            <Card className="border-slate-200 shadow-sm h-full">
                <CardHeader className="pb-3 border-b border-slate-50">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 uppercase tracking-wide">
                        <Briefcase className="w-4 h-4 text-slate-500" /> Thông tin công tác
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Role */}
                    <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-indigo-100 transition-colors">
                        <label className="text-xs font-semibold text-slate-400 uppercase block mb-2">Vai trò hệ thống</label>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md border border-slate-100 text-indigo-600 shadow-sm">
                                <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700 text-sm">{userRoleLabel}</p>
                                <p className="text-xs text-slate-400 font-mono">{user.role}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Job Title */}
                    <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-blue-100 transition-colors">
                        <label className="text-xs font-semibold text-slate-400 uppercase block mb-2">Chức danh / Vị trí</label>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md border border-slate-100 text-blue-600 shadow-sm">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700 text-sm">{user.jobTitle || "Chưa cập nhật"}</p>
                                <p className="text-xs text-slate-400">Chức vụ chính thức</p>
                            </div>
                        </div>
                    </div>

                    {/* Org Unit - Full width */}
                    <div className="md:col-span-2 p-4 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-orange-100 transition-colors">
                         <label className="text-xs font-semibold text-slate-400 uppercase block mb-2">Đơn vị / Phòng ban</label>
                         <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-md border border-slate-100 text-orange-500 shadow-sm">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-base">{user.orgUnitName || "Chưa thuộc phòng ban nào"}</p>
                                {user.parentOrgUnitName && (
                                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                        Trực thuộc: <span className="font-medium text-slate-600">{user.parentOrgUnitName}</span>
                                    </p>
                                )}
                            </div>
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* CỘT PHẢI: TRẠNG THÁI & BẢO MẬT (Chiếm 1 phần) */}
        <div className="space-y-6">
            
            {/* 1. TRẠNG THÁI */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-50">
                    <CardTitle className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" /> Trạng thái
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${user.status ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        <span className="font-bold text-sm flex items-center gap-2">
                            {user.status ? <CheckCircle2 className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}
                            {user.status ? "Đang hoạt động" : "Vô hiệu hóa"}
                        </span>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user.status ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${user.status ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* 2. BẢO MẬT & TÀI KHOẢN */}
            <Card className="border-slate-200 shadow-sm flex flex-col">
                 <CardHeader className="pb-3 border-b border-slate-50">
                    <CardTitle className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Bảo mật & Tài khoản
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                        <p className="mb-1 font-semibold text-slate-600">Lưu ý an toàn:</p>
                        Vui lòng sử dụng mật khẩu mạnh và thay đổi định kỳ để bảo vệ tài khoản của bạn.
                    </div>
                    
                    {/* Nhúng Component Dialog Đổi Mật Khẩu */}
                    <ChangePasswordDialog />
                    
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}