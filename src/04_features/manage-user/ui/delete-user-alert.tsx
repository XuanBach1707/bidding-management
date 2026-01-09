import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/shared/ui/alert-dialog";
import { userApi } from "@/entities/user";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

interface DeleteUserAlertProps {
  userId: number | null; 
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteUserAlert = ({ userId, onClose, onSuccess }: DeleteUserAlertProps) => {
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!userId) return;
    try {
      await userApi.deleteUser(userId);
      toast({ 
        title: "Đã xóa nhân sự", 
        className: "bg-green-600 text-white border-none" 
      });
      onSuccess();
    } catch (error) {
      toast({ 
        title: "Xóa thất bại", 
        variant: "destructive" 
      });
    } finally {
      onClose();
    }
  };

  return (
    <AlertDialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 text-red-600 mb-2">
             <div className="p-2 bg-red-100 rounded-full"><AlertTriangle className="w-6 h-6" /></div>
             <AlertDialogTitle>Xóa tài khoản nhân sự?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Hành động này <strong>không thể hoàn tác</strong>. Tài khoản này sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể truy cập được nữa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white border-none">
            Xóa vĩnh viễn
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};