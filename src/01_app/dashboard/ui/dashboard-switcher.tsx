"use client";

import { useEffect, useState } from "react";
import { Loader2, Construction } from "lucide-react";
import { http } from "@/shared/api";

// 1. Import Enum từ Entity User (Chính xác theo code bạn đưa)
import { UserRole } from "@/entities/user"; 

// 2. Import các Pages từ Layer Pages
import { EngineerDashboardPage } from "@/pages/engieer-dashboard"; 
import { DashboardPage as AdminDashboardPage } from "@/pages/dashboard"; // Alias lại để tránh trùng tên

export const DashboardSwitcher = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // 3. Lấy thông tin User & Role
  useEffect(() => {
    const fetchRole = async () => {
      try {
        // Gọi API lấy thông tin user hiện tại
        // (Response trả về data khớp với UserSchema, nên sẽ có field 'role')
        const res: any = await http.get("/auth/me");
        
        if (res?.data?.role) {
          setRole(res.data.role as UserRole);
        }
      } catch (error) {
        console.error("Lỗi xác thực người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // 4. Logic điều hướng dựa trên UserRole Enum
  switch (role) {
    // --- NHÓM 1: ADMIN & LÃNH ĐẠO (Dashboard Cũ/Admin) ---
    case UserRole.ADMIN:
    case UserRole.MANAGER:
      return <AdminDashboardPage />;

    // --- NHÓM 2: KỸ SƯ & JKAN (Dashboard Mới - Engineer) ---
    case UserRole.ENGINEER:
    case UserRole.JKAN:
      return <EngineerDashboardPage />;

    // --- NHÓM 3: CHỦ TRÌ & CHUYÊN VIÊN (Đang phát triển) ---
    case UserRole.BID_MANAGER:
    case UserRole.SPECIALIST:
      return <ComingSoonPage role={role} />;

    // --- Default: Không xác định ---
    default:
      return (
        <div className="h-screen flex items-center justify-center text-slate-500">
          Không xác định được quyền hạn hoặc phiên đăng nhập hết hạn.
        </div>
      );
  }
};

// Component UI phụ: Màn hình "Đang phát triển"
const ComingSoonPage = ({ role }: { role: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Construction className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Dashboard đang xây dựng</h2>
      <p className="text-slate-500 mb-6">
        Giao diện dành riêng cho vai trò <span className="font-bold text-slate-700">{role}</span> đang được phát triển.
      </p>
      <div className="text-xs text-slate-400">
        Vui lòng quay lại sau hoặc liên hệ Admin.
      </div>
    </div>
  </div>
);