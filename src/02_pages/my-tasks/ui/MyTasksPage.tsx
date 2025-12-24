"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MyTaskList } from "@/widgets/my-task-list";

export const MyTasksPage = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const userInfoRaw = localStorage.getItem("USER_INFO");
    
    if (!userInfoRaw) {
      router.push("/login");
      return;
    }

    try {
      const userInfo = JSON.parse(userInfoRaw);
      const forbiddenRoles = ["MANAGER", "BID_MANAGER"];

      if (forbiddenRoles.includes(userInfo.role)) {
        // Nếu là quản lý, redirect về trang cơ hội hoặc dashboard tổng
        router.push("/opportunities"); 
      } else {
        setIsChecking(false);
      }
    } catch (error) {
      console.error("Lỗi parse USER_INFO:", error);
      router.push("/login");
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Nhiệm vụ của tôi
        </h1>
        <p className="text-sm text-slate-500">
          Quản lý các task được giao trực tiếp cho bạn trên toàn hệ thống.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <MyTaskList />
      </div>
    </div>
  );
};