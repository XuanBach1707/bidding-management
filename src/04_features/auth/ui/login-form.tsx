"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { useToast } from "@/shared/lib/hooks/use-toast"; 
import { authStorage } from "@/shared/lib/auth"; 
import { authApi, LoginRequest, LoginRequestSchema } from "@/features/auth/api/auth.api"; 

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { 
        email: "", 
        password: "", 
        rememberMe: false 
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // 1. Lưu User Info vào storage hiển thị (như cũ)
      if (data.user) {
          authStorage.setUser(data.user);
      }

      // 2. [THÊM MỚI] XỬ LÝ CỜ HIỆU SESSION
      // Lấy giá trị checkbox hiện tại
      const isRemember = form.getValues("rememberMe"); 

      if (isRemember) {
          // Trường hợp GHI NHỚ: Đánh dấu vào LocalStorage (Bền vững)
          localStorage.setItem("IS_PERSISTENT", "true");
          // Xóa cờ session cũ để tránh nhầm lẫn
          sessionStorage.removeItem("SESSION_ACTIVE"); 
      } else {
          // Trường hợp KHÔNG GHI NHỚ: Đánh dấu vào SessionStorage (Tắt tab là mất)
          sessionStorage.setItem("SESSION_ACTIVE", "true");
          // Xóa cờ bền vững cũ
          localStorage.removeItem("IS_PERSISTENT"); 
      }

      toast({
        title: "Đăng nhập thành công",
        description: "Đang chuyển hướng...",
        className: "bg-[#20a19c] text-white border-none shadow-lg",
      });
      
      router.push("/dashboard"); 
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Không thể đăng nhập",
        description: error.message || "Kiểm tra lại email hoặc mật khẩu.",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => loginMutation.mutate(v))} className="space-y-5">
        
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-600 font-semibold text-sm">Email hệ thống</FormLabel>
              <FormControl>
                <Input 
                  placeholder="ten.nguoi.dung@pc1group.vn" 
                  className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#20a19c] focus-visible:border-[#20a19c] transition-all text-base"
                  disabled={loginMutation.isPending}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-600 font-semibold text-sm">Mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#20a19c] focus-visible:border-[#20a19c] transition-all pr-10 text-base"
                      disabled={loginMutation.isPending}
                      {...field} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checkbox Remember Me */}
        <div className="flex items-center justify-between pt-1">
           <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loginMutation.isPending}
                      className="border-slate-300 w-5 h-5 data-[state=checked]:bg-[#20a19c] data-[state=checked]:border-[#20a19c] rounded"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-slate-500 font-medium cursor-pointer select-none">
                      Ghi nhớ đăng nhập <span className="text-xs italic font-normal ml-1"></span>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-bold bg-[#20a19c] hover:bg-[#1a8e8a] transition-all shadow-lg shadow-[#20a19c]/20 rounded-lg mt-4" 
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
          ) : (
              "Đăng nhập"
          )}
        </Button>
        
        <div className="pt-6 text-center">
          <p className="text-sm text-slate-500">
            Bạn gặp sự cố đăng nhập? <a href="#" className="text-[#20a19c] font-semibold hover:underline">Liên hệ IT Support</a>
          </p>
        </div>

      </form>
    </Form>
  );
}