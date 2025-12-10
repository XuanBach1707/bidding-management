"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// 1. Import Shared UI (Vẫn giữ nguyên vì Shadcn không có index.ts gộp)
import { Button } from "@/06_shared/ui/button";
import { Input } from "@/06_shared/ui/input";
import { Label } from "@/06_shared/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/06_shared/ui/card";

// 2. Import Shared Lib (Gọn gàng từ index.ts)
import { authStorage } from "@/06_shared/lib";

// 3. Import Feature API & Schema
import { authApi, LoginRequest, LoginRequestSchema } from "../api/auth-api";

export const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Setup Form với Zod Resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Hàm xử lý Submit
  const onSubmit = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      // Gọi API Login
      const res = await authApi.login(data);

      // Nếu thành công (Có token trả về)
      if (res.accessToken) {
        // Lưu Token & User info vào Storage
        authStorage.setToken(res.accessToken);
        authStorage.setUser(res.user);

        // Chuyển hướng sang Dashboard
        // (Dùng replace để người dùng không back lại trang login được)
        router.replace("/dashboard");
      }
    } catch (error: any) {
      console.error("Login Failed:", error);
      // Hiển thị lỗi từ API hoặc lỗi chung
      // Giả sử API trả lỗi trong error.response.data.message
      const msg = error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
        <CardDescription className="text-center">
          Nhập email và mật khẩu để truy cập hệ thống quản lý đấu thầu
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@pms.com"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <a href="#" className="text-sm font-medium text-primary hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Thông báo lỗi chung */}
          {errorMessage && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {errorMessage}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <a href="#" className="text-primary hover:underline">
            Liên hệ Admin
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};