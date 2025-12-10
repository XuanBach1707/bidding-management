"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

// Import Shared & Entities
// Lưu ý: Đảm bảo đường dẫn import đúng với cấu trúc folder của bạn (vd: @/shared hoặc @/src/06_shared)
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { useToast } from "@/shared/lib/hooks/use-toast"; 
import { authStorage } from "@/shared/lib/auth"; // SỬA: Import đúng file auth-storage

// Import API & Schema
import { authApi, LoginRequest, LoginRequestSchema } from "../api/auth.api"; 

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  // 1. Setup Form với React Hook Form + Zod
  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Setup Mutation (TanStack Query) để gọi API
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // --- CẬP NHẬT LOGIC LƯU STORAGE TẠI ĐÂY ---
      
      // 1. Lưu Access Token
      authStorage.setToken(data.accessToken);

      // 2. Lưu Refresh Token (Nếu có)
      if (data.refreshToken) {
        authStorage.setRefreshToken(data.refreshToken);
      }

      // 3. Lưu Expires In (Nếu có - để tính giờ logout)
      if (data.expiresIn) {
        authStorage.setExpiresIn(data.expiresIn);
      }

      // 4. Lưu User Info (Để hiển thị tên/avatar)
      if (data.user) {
        authStorage.setUser(data.user);
      }

      toast({
        title: "Đăng nhập thành công",
        description: "Đang chuyển hướng...",
      });

      // Chuyển hướng vào trang dashboard
      router.push("/dashboard"); 
    },
    onError: (error: any) => {
      // Xử lý lỗi từ API trả về
      // Vì đã cài camelcase-keys nên error response cũng có thể đã được convert,
      // nhưng để an toàn cứ check cả message thường.
      const msg = error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      
      toast({
        variant: "destructive",
        title: "Lỗi đăng nhập",
        description: msg,
      });
    },
  });

  // 3. Hàm Submit
  const onSubmit = (values: LoginRequest) => {
    loginMutation.mutate(values);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
        <CardDescription className="text-center">
          Nhập email và mật khẩu để truy cập hệ thống quản lý thầu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Field Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending} // Disable khi đang call API
            >
              {loginMutation.isPending ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
            
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}