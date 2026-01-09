// File: src/02_pages/profile/ui/page.tsx

"use client";

import React, { useEffect, useRef } from "react";
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
  Camera,
  Loader2
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
  
  // Ref để kích hoạt input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load lại thông tin user mới nhất khi vào trang
  useEffect(() => {
    refreshUser();
  }, []);

  // --- LOGIC UPLOAD AVATAR ---
  const uploadMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: () => {
      toast({
        title: "Cập nhật thành công",
        description: "Ảnh đại diện mới đã được áp dụng.",
        className: "bg-[#009d98] text-white border-none shadow-lg",
      });
      refreshUser(); // Quan trọng: Gọi lại API me để lấy URL ảnh mới
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
      // Validate Client-side: Max 100MB
      if (file.size > 100 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File quá lớn",
          description: "Vui lòng chọn ảnh có dung lượng dưới 100MB.",
        });
        return;
      }
      // Gọi API Upload
      uploadMutation.mutate(file);
    }
    // Reset input để cho phép chọn lại cùng 1 file nếu cần
    event.target.value = "";
  };

  const handleAvatarClick = () => {
    // Chỉ cho phép click khi không đang upload
    if (!uploadMutation.isPending) {
        fileInputRef.current?.click();
    }
  };
  // ---------------------------

  // Safety check
  if (!user) return null; 

  // Format dữ liệu hiển thị
  const userRoleLabel = USER_ROLE_LABELS[user.role as UserRole] || user.role;
  // Đảm bảo avatarUrl hợp lệ (Backend trả về null hoặc string)
  const avatarSrc = user.avatarUrl || undefined;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* INPUT FILE ẨN (Ẩn hoàn toàn khỏi giao diện) */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileChange}
      />

      {/* 1. HEADER PROFILE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
            
            {/* AVATAR INTERACTIVE */}
            <div 
                className="relative group cursor-pointer" 
                onClick={handleAvatarClick}
                title="Nhấn để đổi ảnh đại diện"
            >
                {/* Viền avatar: Đổi màu khi hover */}
                <Avatar className="w-24 h-24 border-[3px] border-slate-100 shadow-sm group-hover:border-[#009d98] transition-all duration-300">
                    <AvatarImage 
                      src={avatarSrc} 
                      alt={user.fullName} 
                      className={`object-cover ${uploadMutation.isPending ? "opacity-50 grayscale" : ""}`}
                    />
                    <AvatarFallback className="text-3xl font-extrabold bg-[#009d98]/5 text-[#009d98]">
                      {user.fullName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>

                {/* Lớp phủ (Overlay): Hiện Icon Camera hoặc Loader */}
                <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[1px]">
                    {uploadMutation.isPending ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                        <Camera className="w-8 h-8 text-white drop-shadow-md" />
                    )}
                </div>

                {/* Nút nhỏ góc dưới (Chỉ thị edit) */}
                {!uploadMutation.isPending && (
                    <div className="absolute bottom-0 right-0 bg-white border border-slate-200 p-1.5 rounded-full shadow-md group-hover:bg-[#009d98] group-hover:border-[#009d98] transition-colors">
                        <Camera className="w-3 h-3 text-slate-500 group-hover:text-white" />
                    </div>
                )}
            </div>

            {/* THÔNG TIN CƠ BẢN */}
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {user.fullName}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-600 hover:text-[#009d98] transition-colors cursor-pointer" title="Email công việc">
                       <Mail className="w-4 h-4" /> {user.email}
                    </span>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                      ID: #{user.userId}
                    </span>
                </div>
            </div>
        </div>
        
        {/* NÚT ĐĂNG XUẤT */}
        <Button 
          variant="outline" 
          onClick={logout}
          className="text-red-600 border-red-200 bg-red-50 hover:bg-red-600 hover:text-white hover:border-red-600 gap-2 shadow-sm transition-all h-10 px-5 font-semibold"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </Button>
      </div>

      {/* 2. GRID CHI TIẾT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- CỘT TRÁI: THÔNG TIN CÔNG TÁC (Chiếm 2 phần) --- */}
        <div className="space-y-6 lg:col-span-2 h-full">
            <Card className="border-slate-200 shadow-sm h-full bg-white flex flex-col">
                <CardHeader className="pb-4 border-b border-slate-50">
                    <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                        <Briefcase className="w-4 h-4" /> Thông tin công tác
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    
                    {/* Item: Role */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#009d98]/30 transition-colors group">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3 group-hover:text-[#009d98] transition-colors">Vai trò hệ thống</label>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[#009d98] shadow-sm">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{userRoleLabel}</p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{user.role}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Item: Job Title */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#009d98]/30 transition-colors group">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3 group-hover:text-[#009d98] transition-colors">Chức danh / Vị trí</label>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[#009d98] shadow-sm">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{user.jobTitle || "Chưa cập nhật"}</p>
                                <p className="text-xs text-slate-400 mt-0.5">Chức vụ chính thức</p>
                            </div>
                        </div>
                    </div>

                    {/* Item: Org Unit (Full width) */}
                    <div className="md:col-span-2 p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#009d98]/30 transition-colors group">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3 group-hover:text-[#009d98] transition-colors">Đơn vị / Phòng ban</label>
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[#009d98] shadow-sm">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-base">{user.orgUnitName || "Chưa thuộc phòng ban nào"}</p>
                                {user.parentOrgUnitName && (
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        Trực thuộc: <span className="font-semibold text-slate-700">{user.parentOrgUnitName}</span>
                                    </p>
                                )}
                            </div>
                          </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* --- CỘT PHẢI: TRẠNG THÁI & BẢO MẬT (Chiếm 1 phần) --- */}
        <div className="space-y-6">
            
            {/* Card: Trạng thái */}
            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-4 border-b border-slate-50">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                      <CalendarDays className="w-4 h-4" /> Trạng thái
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${user.status ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        <span className="font-bold text-sm flex items-center gap-2.5">
                            {user.status ? <CheckCircle2 className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                            {user.status ? "Đang hoạt động" : "Vô hiệu hóa"}
                        </span>
                        
                        {/* Hiệu ứng Pulse nhẹ */}
                        <span className="relative flex h-3 w-3 mr-1">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user.status ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-3 w-3 ${user.status ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Card: Bảo mật */}
            <Card className="border-slate-200 shadow-sm flex flex-col bg-white">
                 <CardHeader className="pb-4 border-b border-slate-50">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> Bảo mật
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 flex-1 flex flex-col gap-5">
                    
                    {/* Note an toàn */}
                    <div className="text-xs text-slate-600 leading-relaxed bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <p className="mb-1.5 font-bold text-amber-700 flex items-center gap-1">
                            Lưu ý an toàn
                        </p>
                        Vui lòng sử dụng mật khẩu mạnh và thay đổi định kỳ để bảo vệ tài khoản hệ thống của bạn.
                    </div>
                    
                    {/* Component Đổi Mật Khẩu (Nút bấm nằm trong này) */}
                    <ChangePasswordDialog />
                    
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}