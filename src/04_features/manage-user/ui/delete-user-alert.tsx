import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/shared/ui/alert-dialog";
import { userApi } from "@/entities/user";
import { useToast } from "@/shared/lib/hooks/use-toast";

interface DeleteUserAlertProps {
  userId: number | null; // Nếu null thì dialog đóng
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteUserAlert = ({ userId, onClose, onSuccess }: DeleteUserAlertProps) => {
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!userId) return;
    try {
      await userApi.deleteUser(userId);
      
      // [SỬA LỖI] Thay variant="success" bằng className màu xanh
      toast({ 
        title: "Đã xóa nhân sự", 
        className: "bg-green-600 text-white" 
      });
      
      onSuccess();
    } catch (error) {
      // Variant "destructive" là mặc định có sẵn cho thông báo lỗi
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
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Tài khoản người dùng sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
            Xóa vĩnh viễn
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};