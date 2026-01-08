"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Lock } from "lucide-react";

// Import UI Components
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { useToast } from "@/shared/lib/hooks/use-toast"; 

// Import API & Schema
import { userApi } from "@/entities/user";
import { ChangePasswordSchema } from "@/entities/user/model/schemas";
import { ChangePasswordFormValues } from "@/entities/user/model/types";

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await userApi.changePassword(values);

      toast({
        title: "Thành công",
        description: "Mật khẩu đã được thay đổi. Vui lòng sử dụng mật khẩu mới cho lần đăng nhập sau.",
        variant: "default",
        className: "bg-emerald-50 border-emerald-200 text-emerald-800",
      });
      
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Đổi mật khẩu thất bại",
        description: error?.message || "Đã có lỗi xảy ra, vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        if (!val) form.reset();
        setOpen(val);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200">
           <KeyRound className="w-4 h-4" /> Đổi mật khẩu
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Đổi mật khẩu
          </DialogTitle>
          <DialogDescription>
            Thiết lập mật khẩu mới cho tài khoản của bạn. Mật khẩu nên có ít nhất 6 ký tự.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input 
                        type="password" 
                        placeholder="••••••••" 
                        autoComplete="new-password"
                        {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input 
                        type="password" 
                        placeholder="••••••••" 
                        autoComplete="new-password"
                        {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Hủy bỏ
              </Button>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}