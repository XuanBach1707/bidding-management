// File: src/02_pages/profile/ui/page.tsx

"use client";

import React, { useEffect, useRef } from "react";
import { 
  LogOut, User as UserIcon, Building2, Briefcase, Mail, 
  CheckCircle2, XCircle, MapPin, CalendarDays, ShieldCheck, 
  Camera, Loader2
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

// UI Components
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useToast } from "@/shared/lib/hooks/use-toast";

// Context & Logic
import { useAuth } from "@/features/auth/model/auth-context";
import { UserRole, USER_ROLE_LABELS, userApi } from "@/entities/user";
import { ChangePasswordDialog } from "@/features/auth"; 

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth(); 
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshUser();
  }, []);

  // --- LOGIC UPLOAD AVATAR (Giữ nguyên) ---
  const uploadMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: () => {
      toast({
        title: "Cập nhật thành công",
        description: "Ảnh đại diện mới đã được áp dụng.",
        className: "bg-[#009d98] text-white border-none shadow-lg",
      });
      refreshUser();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Không thể tải ảnh lên",
        description: error.message || "Vui lòng kiểm tra lại kết nối.",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File quá lớn",
          description: "Vui lòng chọn ảnh có dung lượng dưới 10MB.",
        });
        return;
      }
      uploadMutation.mutate(file);
    }
    event.target.value = "";
  };

  const handleAvatarClick = () => {
    if (!uploadMutation.isPending) {
        fileInputRef.current?.click();
    }
  };
  // ---------------------------

  if (!user) return null; 

  const userRoleLabel = USER_ROLE_LABELS[user.role as UserRole] || user.role;
  const avatarSrc = user.avatarUrl || undefined;

  return (
    // [UPDATE] Mobile: gap-4, Desktop: gap-6
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-10">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileChange}
      />

      {/* 1. HEADER PROFILE */}
      {/* [UPDATE] Mobile: flex-col center, Desktop: flex-row */}
      <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        
        {/* Decorative Background cho Mobile thêm sinh động */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-50 to-white md:hidden -z-0" />

        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 z-10 w-full md:w-auto">
            
            {/* AVATAR INTERACTIVE */}
            <div 
                className="relative group cursor-pointer shrink-0" 
                onClick={handleAvatarClick}
                title="Nhấn để đổi ảnh đại diện"
            >
                <Avatar className="w-24 h-24 md:w-24 md:h-24 border-[4px] border-white md:border-slate-100 shadow-md group-hover:border-[#009d98] transition-all duration-300">
                    <AvatarImage 
                      src={avatarSrc} 
                      alt={user.fullName} 
                      className={`object-cover ${uploadMutation.isPending ? "opacity-50 grayscale" : ""}`}
                    />
                    <AvatarFallback className="text-3xl font-extrabold bg-[#009d98]/5 text-[#009d98]">
                      {user.fullName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>

                {/* Overlay Loader/Camera */}
                <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[1px]">
                    {uploadMutation.isPending ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                        <Camera className="w-8 h-8 text-white drop-shadow-md" />
                    )}
                </div>

                {/* Edit Indicator */}
                {!uploadMutation.isPending && (
                    <div className="absolute bottom-0 right-0 bg-white border border-slate-200 p-1.5 rounded-full shadow-md group-hover:bg-[#009d98] group-hover:border-[#009d98] transition-colors">
                        <Camera className="w-3 h-3 text-slate-500 group-hover:text-white" />
                    </div>
                )}
            </div>

            {/* THÔNG TIN CƠ BẢN */}
            {/* [UPDATE] Mobile: text-center, Desktop: text-left */}
            <div className="text-center md:text-left w-full">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                    {user.fullName}
                </h1>
                
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-sm text-slate-500 mt-2 font-medium justify-center md:justify-start">
                    <span className="flex items-center gap-1.5 text-slate-600 hover:text-[#009d98] transition-colors cursor-pointer break-all" title="Email công việc">
                       <Mail className="w-3.5 h-3.5" /> {user.email}
                    </span>
                    <span className="text-slate-300 hidden md:inline">|</span>
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 inline-block">
                      ID: #{user.userId}
                    </span>
                </div>
            </div>
        </div>
        
        {/* NÚT ĐĂNG XUẤT */}
        {/* [UPDATE] Mobile: w-full, Desktop: w-auto */}
        <Button 
          variant="outline" 
          onClick={logout}
          className="w-full md:w-auto text-red-600 border-red-200 bg-red-50 hover:bg-red-600 hover:text-white hover:border-red-600 gap-2 shadow-sm transition-all h-10 px-5 font-semibold z-10"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </Button>
      </div>

      {/* 2. GRID CHI TIẾT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* --- CỘT TRÁI: THÔNG TIN CÔNG TÁC --- */}
        <div className="space-y-4 md:space-y-6 lg:col-span-2 h-full">
            <Card className="border-slate-200 shadow-sm h-full bg-white flex flex-col">
                <CardHeader className="pb-4 border-b border-slate-50 p-4 md:p-6">
                    <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                        <Briefcase className="w-4 h-4" /> Thông tin công tác
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1">
                    
                    {/* Item: Role */}
                    <div className="p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#009d98]/30 transition-colors group">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 md:mb-3 group-hover:text-[#009d98] transition-colors">Vai trò hệ thống</label>
                        <div className="flex items-center gap-3">
                            <div className="p-2 md:p-2.5 bg-white rounded-lg border border-slate-200 text-[#009d98] shadow-sm shrink-0">
                                <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 text-sm truncate">{userRoleLabel}</p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{user.role}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Item: Job Title */}
                    <div className="p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#009d98]/30 transition-colors group">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 md:mb-3 group-hover:text-[#009d98] transition-colors">Chức danh / Vị trí</label>
                        <div className="flex items-center gap-3">
                            <div className="p-2 md:p-2.5 bg-white rounded-lg border border-slate-200 text-[#009d98] shadow-sm shrink-0">
                                <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 text-sm truncate">{user.jobTitle || "Chưa cập nhật"}</p>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">Chức vụ chính thức</p>
                            </div>
                        </div>
                    </div>

                    {/* Item: Org Unit */}
                    <div className="md:col-span-2 p-4 md:p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#009d98]/30 transition-colors group">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 md:mb-3 group-hover:text-[#009d98] transition-colors">Đơn vị / Phòng ban</label>
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="p-2 md:p-2.5 bg-white rounded-lg border border-slate-200 text-[#009d98] shadow-sm shrink-0">
                                <Building2 className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm md:text-base truncate">{user.orgUnitName || "Chưa thuộc phòng ban nào"}</p>
                                {user.parentOrgUnitName && (
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
                                        Trực thuộc: <span className="font-semibold text-slate-700 truncate">{user.parentOrgUnitName}</span>
                                    </p>
                                )}
                            </div>
                          </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* --- CỘT PHẢI: TRẠNG THÁI & BẢO MẬT --- */}
        <div className="space-y-4 md:space-y-6">
            
            {/* Card: Trạng thái */}
            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-4 border-b border-slate-50 p-4 md:p-6">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                      <CalendarDays className="w-4 h-4" /> Trạng thái
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-5">
                    <div className={`flex items-center justify-between p-3 md:p-4 rounded-xl border ${user.status ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        <span className="font-bold text-sm flex items-center gap-2.5">
                            {user.status ? <CheckCircle2 className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                            {user.status ? "Đang hoạt động" : "Vô hiệu hóa"}
                        </span>
                        <span className="relative flex h-3 w-3 mr-1">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user.status ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-3 w-3 ${user.status ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Card: Bảo mật */}
            <Card className="border-slate-200 shadow-sm flex flex-col bg-white">
                 <CardHeader className="pb-4 border-b border-slate-50 p-4 md:p-6">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> Bảo mật
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-5 flex-1 flex flex-col gap-4 md:gap-5">
                    <div className="text-xs text-slate-600 leading-relaxed bg-amber-50 p-3 md:p-4 rounded-xl border border-amber-100">
                        <p className="mb-1.5 font-bold text-amber-700 flex items-center gap-1">
                            Lưu ý an toàn
                        </p>
                        Vui lòng sử dụng mật khẩu mạnh và thay đổi định kỳ để bảo vệ tài khoản.
                    </div>
                    {/* Component Đổi Mật Khẩu */}
                    <div className="w-full">
                        <ChangePasswordDialog />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}