import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  User, 
  CreateUserSchema, 
  UpdateUserSchema, 
  CreateUserFormValues, // Dùng type full để register input không bị lỗi
  UserRole, 
  SecurityLevel, 
  USER_ROLE_LABELS, 
  SECURITY_LEVEL_LABELS,
  userApi
} from "@/entities/user";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/shared/ui/dialog"; 
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { useToast } from "@/shared/lib/hooks/use-toast"; 

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: User | null; 
  onSuccess: () => void;
}

export const UserFormDialog = ({ open, onOpenChange, userToEdit, onSuccess }: UserFormDialogProps) => {
  const { toast } = useToast();
  const isEditMode = !!userToEdit;

  // Chọn Schema validation tương ứng
  const schema = isEditMode ? UpdateUserSchema : CreateUserSchema;
  
  const form = useForm<CreateUserFormValues>({
    // [FIX 1] Ép kiểu schema as any
    // Lý do: Để tránh xung đột type giữa UpdateSchema (thiếu password) và FormType (có password).
    // Logic của chúng ta vẫn đúng vì ở Edit Mode ta ẩn input password đi.
    resolver: zodResolver(schema as any),
    
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      role: UserRole.ENGINEER,
      jobTitle: "",
      securityClearance: SecurityLevel.INTERNAL,
      status: true,
      orgUnitId: 0,
    }
  });

  // Reset form khi mở dialog hoặc đổi user
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
            email: "", 
            fullName: "", 
            password: "", 
            role: UserRole.ENGINEER, 
            securityClearance: SecurityLevel.INTERNAL, 
            status: true,
            orgUnitId: 0,
            jobTitle: ""
        });
      }
    }
  }, [open, userToEdit, form]);

  // [FIX 2] Đổi type tham số thành 'any' hoặc union type
  // Vì khi ở Edit Mode, data gửi lên sẽ thiếu password/email, không khớp hoàn toàn với CreateUserFormValues
  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && userToEdit) {
        // data lúc này là UpdateUserFormValues (đã được validate qua UpdateUserSchema)
        await userApi.updateUser(userToEdit.userId, data);
        toast({ title: "Cập nhật thành công", className: "bg-green-600 text-white" });
      } else {
        // data lúc này là CreateUserFormValues
        await userApi.createUser(data);
        toast({ title: "Tạo mới thành công", className: "bg-green-600 text-white" });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Có lỗi xảy ra", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Cập nhật nhân sự" : "Thêm mới nhân sự"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label>Họ và tên <span className="text-red-500">*</span></Label>
              <Input {...form.register("fullName")} placeholder="Nguyễn Văn A" />
              {form.formState.errors.fullName && <p className="text-red-500 text-xs">{form.formState.errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input {...form.register("email")} placeholder="a@company.com" disabled={isEditMode} />
              {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
            </div>
          </div>

          {/* Password (Chỉ hiện khi Create) */}
          {!isEditMode && (
             <div className="space-y-2">
               <Label>Mật khẩu khởi tạo <span className="text-red-500">*</span></Label>
               <Input type="password" {...form.register("password")} />
               {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             {/* Role */}
             <div className="space-y-2">
                <Label>Vai trò</Label>
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

             {/* Security Level */}
             <div className="space-y-2">
                <Label>Mức độ bảo mật</Label>
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
             <Label>Chức danh (Job Title)</Label>
             <Input {...form.register("jobTitle")} placeholder="Ví dụ: Kỹ sư cầu đường" />
          </div>

          <DialogFooter>
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
             <Button type="submit" disabled={form.formState.isSubmitting}>
               {form.formState.isSubmitting ? "Đang xử lý..." : (isEditMode ? "Lưu thay đổi" : "Tạo mới")}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};