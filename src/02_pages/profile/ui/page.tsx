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
  CalendarDays // Thêm icon này để trang trí thêm nếu cần
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useAuth } from "@/features/auth/model/auth-context";
import { 
  UserRole, 
  USER_ROLE_LABELS 
} from "@/entities/user";

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth(); 

  // Gọi API làm mới dữ liệu ngay khi vào trang
  useEffect(() => {
    refreshUser();
  }, []);

  if (!user) return null; 

  const userRoleLabel = USER_ROLE_LABELS[user.role as UserRole] || user.role;
  
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* 1. HEADER */}
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
                    <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">ID: #{user.userId}</span>
                </div>
            </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={logout}
          className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 gap-2"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI: THÔNG TIN CÔNG TÁC (Chiếm 2 phần) */}
        <div className="space-y-6 lg:col-span-2">
            <Card className="border-slate-200 shadow-sm h-full">
                <CardHeader className="pb-3 border-b border-slate-50">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                        <Briefcase className="w-4 h-4 text-slate-500" /> Thông tin công tác
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Role */}
                    <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                        <label className="text-xs font-semibold text-slate-400 uppercase block mb-2">Vai trò hệ thống</label>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md border border-slate-100 text-indigo-600">
                                <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700 text-sm">{userRoleLabel}</p>
                                <p className="text-xs text-slate-400 font-mono">{user.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Job Title */}
                    <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                        <label className="text-xs font-semibold text-slate-400 uppercase block mb-2">Chức danh / Vị trí</label>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md border border-slate-100 text-blue-600">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700 text-sm">{user.jobTitle || "Chưa cập nhật"}</p>
                                <p className="text-xs text-slate-400">Chức vụ chính thức</p>
                            </div>
                        </div>
                    </div>

                    {/* Organization Unit - Full width */}
                    <div className="md:col-span-2 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                         <label className="text-xs font-semibold text-slate-400 uppercase block mb-2">Đơn vị / Phòng ban</label>
                         <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-md border border-slate-100 text-orange-500">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-base">{user.orgUnitName || "Chưa thuộc phòng ban nào"}</p>
                                {user.parentOrgUnitName && (
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Trực thuộc: <span className="font-medium text-slate-600">{user.parentOrgUnitName}</span>
                                    </p>
                                )}
                            </div>
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* CỘT PHẢI: TRẠNG THÁI (Chiếm 1 phần) */}
        <div className="space-y-6">
            
            {/* TRẠNG THÁI TÀI KHOẢN */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-50">
                    <CardTitle className="text-sm font-bold text-slate-500 uppercase">Trạng thái tài khoản</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${user.status ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        <span className="font-medium text-sm flex items-center gap-2">
                            {user.status ? <CheckCircle2 className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}
                            {user.status ? "Đang hoạt động" : "Vô hiệu hóa"}
                        </span>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user.status ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${user.status ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </span>
                    </div>
                    
                    {/* Thêm chút thông tin phụ cho đỡ trống */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 px-1">
                        <CalendarDays className="w-3.5 h-3.5"/>
                        <span>Tham gia hệ thống: --/--/----</span>
                    </div>
                </CardContent>
            </Card>

            {/* [ĐÃ XÓA]: Card Security Clearance */}
        </div>
      </div>
    </div>
  );
}