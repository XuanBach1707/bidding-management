"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Eye, EyeOff } from "lucide-react"; // Bỏ ArrowRight vì ảnh mẫu không có

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { useToast } from "@/shared/lib/hooks/use-toast"; 
import { authStorage } from "@/shared/lib";
import { authApi, LoginRequest, LoginRequestSchema } from "../api/auth.api"; 

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      authStorage.setToken(data.accessToken);
      if (data.refreshToken) authStorage.setRefreshToken(data.refreshToken);
      if (data.expiresIn) authStorage.setExpiresAt(data.expiresIn);
      if (data.user) authStorage.setUser(data.user);

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

        {/* Options Row */}
        <div className="flex items-center justify-between pt-1">
           <div className="flex items-center gap-2">
              <Checkbox 
                id="remember" 
                className="border-slate-300 w-5 h-5 data-[state=checked]:bg-[#20a19c] data-[state=checked]:border-[#20a19c] rounded"
              />
              <label htmlFor="remember" className="text-sm text-slate-500 font-medium cursor-pointer select-none">
                Ghi nhớ đăng nhập
              </label>
           </div>
           {/* Trong ảnh mẫu (Screenshot 2) không thấy nút Quên mật khẩu, nhưng nếu cần thì có thể uncomment dòng dưới */}
           {/* <a href="#" className="text-sm font-semibold text-[#20a19c] hover:underline">Quên mật khẩu?</a> */}
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
        
        {/* New Footer */}
        <div className="pt-6 text-center">
          <p className="text-sm text-slate-500">
            Bạn gặp sự cố đăng nhập? <a href="#" className="text-[#20a19c] font-semibold hover:underline">Liên hệ IT Support</a>
          </p>
        </div>

      </form>
    </Form>
  );
}