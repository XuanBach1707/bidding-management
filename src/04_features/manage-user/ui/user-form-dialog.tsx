import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  User, 
  CreateUserSchema, 
  UpdateUserSchema, 
  CreateUserFormValues,
  UserRole, 
  SecurityLevel, 
  USER_ROLE_LABELS, 
  SECURITY_LEVEL_LABELS,
  userApi
} from "@/entities/user";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/shared/ui/dialog"; 
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { useToast } from "@/shared/lib/hooks/use-toast"; 
import { Loader2, UserPlus, Pencil } from "lucide-react";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: User | null; 
  onSuccess: () => void;
}

export const UserFormDialog = ({ open, onOpenChange, userToEdit, onSuccess }: UserFormDialogProps) => {
  const { toast } = useToast();
  const isEditMode = !!userToEdit;

  const schema = isEditMode ? UpdateUserSchema : CreateUserSchema;
  
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      email: "", fullName: "", password: "", role: UserRole.ENGINEER,
      jobTitle: "", securityClearance: SecurityLevel.INTERNAL, status: true, orgUnitId: 0,
    }
  });

  useEffect(() => {
    if (open) {
      if (userToEdit) {
        form.reset({
          email: userToEdit.email || "",
          fullName: userToEdit.fullName,
          role: userToEdit.role,
          jobTitle: userToEdit.jobTitle || "",
          securityClearance: userToEdit.securityClearance,
          status: userToEdit.status,
          orgUnitId: userToEdit.orgUnitId || 0,
          password: "", 
        });
      } else {
        form.reset({
            email: "", fullName: "", password: "", role: UserRole.ENGINEER, 
            securityClearance: SecurityLevel.INTERNAL, status: true, orgUnitId: 0, jobTitle: ""
        });
      }
    }
  }, [open, userToEdit, form]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && userToEdit) {
        await userApi.updateUser(userToEdit.userId, data);
        toast({ title: "Cập nhật thành công", className: "bg-[#009d98] text-white border-none" });
      } else {
        await userApi.createUser(data);
        toast({ title: "Tạo mới thành công", className: "bg-[#009d98] text-white border-none" });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Có lỗi xảy ra", description: "Vui lòng thử lại sau.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
             {isEditMode ? <Pencil className="w-5 h-5 text-[#009d98]" /> : <UserPlus className="w-5 h-5 text-[#009d98]" />}
             {isEditMode ? "Cập nhật thông tin nhân sự" : "Thêm mới nhân sự"}
          </DialogTitle>
          <DialogDescription>
             Điền đầy đủ thông tin để {isEditMode ? "cập nhật" : "tạo"} tài khoản truy cập hệ thống.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-2">
          
          {/* Group 1: Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-5 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Họ và tên <span className="text-red-500">*</span></Label>
              <Input {...form.register("fullName")} placeholder="Nguyễn Văn A" className="bg-white" />
              {form.formState.errors.fullName && <p className="text-red-500 text-xs">{form.formState.errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Email <span className="text-red-500">*</span></Label>
              <Input {...form.register("email")} placeholder="a@company.com" disabled={isEditMode} className="bg-white" />
              {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
            </div>
          </div>

          {/* Group 2: Password (Create Only) */}
          {!isEditMode && (
             <div className="space-y-2">
               <Label className="text-slate-700 font-semibold">Mật khẩu khởi tạo <span className="text-red-500">*</span></Label>
               <Input type="password" {...form.register("password")} placeholder="••••••••" />
               {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
             </div>
          )}

          {/* Group 3: Phân quyền & Chức vụ */}
          <div className="grid grid-cols-2 gap-5">
             <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Vai trò hệ thống</Label>
                <Select 
                    onValueChange={(val) => form.setValue("role", val as UserRole)} 
                    value={form.watch("role")}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map((role) => (
                      <SelectItem key={role} value={role}>{USER_ROLE_LABELS[role]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>

             <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Mức độ bảo mật</Label>
                <Select 
                    onValueChange={(val) => form.setValue("securityClearance", Number(val))} 
                    value={String(form.watch("securityClearance"))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(SecurityLevel).filter(v => typeof v === 'number').map((level) => (
                      <SelectItem key={level} value={String(level)}>{SECURITY_LEVEL_LABELS[level as SecurityLevel]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
          </div>
          
          <div className="space-y-2">
             <Label className="text-slate-700 font-semibold">Chức danh / Vị trí</Label>
             <Input {...form.register("jobTitle")} placeholder="Ví dụ: Chuyên viên đấu thầu" />
          </div>

          <DialogFooter className="pt-4">
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy bỏ</Button>
             <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#009d98] hover:bg-[#008580] text-white">
               {form.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               {isEditMode ? "Lưu thay đổi" : "Tạo tài khoản"}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};