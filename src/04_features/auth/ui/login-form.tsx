"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

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
        className: "bg-[#009d98] text-white border-none shadow-lg",
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
      <form onSubmit={form.handleSubmit((v) => loginMutation.mutate(v))} className="space-y-6">
        
        <div className="space-y-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Email hệ thống</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ten.nguoi.dung@pc1group.vn" 
                      className="h-12 bg-white border-slate-200 focus-visible:ring-[#009d98] focus-visible:border-[#009d98] transition-all"
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
                  <div className="flex items-center justify-between">
                      <FormLabel className="text-slate-700 font-medium">Mật khẩu</FormLabel>
                  </div>
                  <FormControl>
                    <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          className="h-12 bg-white border-slate-200 focus-visible:ring-[#009d98] focus-visible:border-[#009d98] transition-all pr-10"
                          disabled={loginMutation.isPending}
                          {...field} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Checkbox id="remember" className="border-slate-300 data-[state=checked]:bg-[#009d98] data-[state=checked]:border-[#009d98]"/>
              <label htmlFor="remember" className="text-sm text-slate-600 font-medium cursor-pointer selection:bg-none">Ghi nhớ</label>
           </div>
           <a href="#" className="text-sm font-semibold text-[#009d98] hover:text-[#007a76] hover:underline">
              Quên mật khẩu?
           </a>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-base font-bold bg-[#009d98] hover:bg-[#008580] transition-all shadow-md hover:shadow-lg disabled:opacity-70" 
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
          ) : (
              <span className="flex items-center gap-2">
                Đăng nhập <ArrowRight className="w-4 h-4" />
              </span>
          )}
        </Button>
        
      </form>
    </Form>
  );
}