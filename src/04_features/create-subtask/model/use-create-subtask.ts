import { useState } from "react";
import { taskApi, CreateTaskDto, TaskPriority, TaskType, TaskStatus } from "@/entities/task";
import { useToast } from "@/shared/lib/hooks/use-toast";

interface UseCreateSubtaskProps {
  parentId: number;
  biddingProjectId: number;
  parentUnitId: number; 
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
    deadline?: string; 
    description?: string;
    priority?: TaskPriority;
    attachmentUrl?: string;
    status?: TaskStatus; // [MỚI] Chấp nhận status truyền vào
  }) => {
    if (!values.taskName.trim()) {
      toast({ title: "Lỗi", description: "Tên công việc không được để trống", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateTaskDto = {
        biddingProjectId,
        parentTaskId: parentId,
        taskName: values.taskName,
        taskType: values.taskType,
        deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
        description: values.description,
        priority: values.priority || "MEDIUM",
        tag: undefined, 
        attachmentUrl: values.attachmentUrl ? [values.attachmentUrl] : [],
        
        assignments: [{
          assignedUnitId: parentUnitId,
          assignedUserId: values.assigneeId || null,
          assignmentType: "MAIN",
          requiredRole: "SPECIALIST",
          requiredMinSecurity: 2,
          isAccepted: false
        }],
        
        // [SỬA] Không khóa cứng OPEN nữa, lấy từ values hoặc mặc định OPEN
        status: values.status || "OPEN",
        sourceType: "USER",
        assigneeId: values.assigneeId, 
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