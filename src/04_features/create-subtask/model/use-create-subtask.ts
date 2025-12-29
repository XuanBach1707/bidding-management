import { useState } from "react";
import { taskApi, CreateTaskDto, TaskPriority, TaskType } from "@/entities/task";
import { useToast } from "@/shared/lib/hooks/use-toast";

interface UseCreateSubtaskProps {
  parentId: number;
  biddingProjectId: number;
  parentUnitId: number; // ID phòng ban của Task cha (để thừa kế)
  onSuccess?: () => void;
}

export const useCreateSubtask = ({ 
  parentId, 
  biddingProjectId, 
  parentUnitId, 
  onSuccess 
}: UseCreateSubtaskProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSubtask = async (values: {
    taskName: string;
    taskType: TaskType;
    assigneeId?: number | null;
    deadline?: string; // YYYY-MM-DD
    description?: string;
    priority?: TaskPriority;
    attachmentUrl?: string; // Input từ form thường là string đơn
  }) => {
    if (!values.taskName.trim()) {
      toast({ title: "Lỗi", description: "Tên công việc không được để trống", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Construct Payload đúng chuẩn API
      const payload: CreateTaskDto = {
        biddingProjectId,
        parentTaskId: parentId,
        taskName: values.taskName,
        taskType: values.taskType,
        
        // Deadline: Convert sang ISO nếu có
        deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
        
        description: values.description,
        priority: values.priority || "MEDIUM",
        
        // Subtask tag là null/undefined
        tag: undefined, 

        // --- SỬA Ở ĐÂY: Thêm trường attachmentUrl ---
        // Convert từ string (nếu có) sang mảng string [] để khớp với DTO
        attachmentUrl: values.attachmentUrl ? [values.attachmentUrl] : [],
        // ------------------------------------------
        
        // Logic gán người
        assignments: [{
          assignedUnitId: parentUnitId, // Thừa kế unit từ cha
          assignedUserId: values.assigneeId || null,
          assignmentType: "MAIN",
          requiredRole: "SPECIALIST",
          requiredMinSecurity: 2,
          isAccepted: false
        }],
        
        // Các trường mặc định khác
        status: "OPEN",
        sourceType: "USER",
        assigneeId: values.assigneeId, // Có thể cần gửi cả ở root level tùy BE logic
      };

      await taskApi.create(payload);
      
      toast({ title: "Thành công", description: "Đã tạo công việc mới" });
      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Lỗi tạo công việc", description: error?.message || "Có lỗi xảy ra", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createSubtask, isSubmitting };
};