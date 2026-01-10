import { useState, useEffect } from "react";
import { format } from "date-fns"; 
import { Calendar as CalendarIcon, X } from "lucide-react"; 
import { useToast } from "@/shared/lib/hooks/use-toast";
import { 
  taskApi, 
  Task, 
  TaskType, 
  TaskPriority, 
  TaskStatus,
  CreateTaskDto 
} from "@/entities/task"; 
import { AssigneeSelect } from "@/features/select-assignee";
import { TaskCommentSection } from "@/features/task-comment";
import { useCreateSubtask } from "../model/use-create-subtask";

// Import UI Shadcn
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";

interface DetailSubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: number;
  biddingProjectId: number;
  parentUnitId: number;
  onSuccess: () => void;
  existingTask?: Task | null;
}

export const DetailSubtaskModal = ({
  isOpen, onClose, parentId, biddingProjectId, parentUnitId, onSuccess, existingTask
}: DetailSubtaskModalProps) => {
  const { toast } = useToast();
  
  // --- FORM STATE ---
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("DRAFTING");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("OPEN");
  
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  
  // [SỬA] Đổi state deadline sang kiểu Date | undefined
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const [isUpdating, setIsUpdating] = useState(false);

  // Logic Create
  const { createSubtask, isSubmitting } = useCreateSubtask({
    parentId,
    biddingProjectId,
    parentUnitId,
    onSuccess: () => {
      onClose();
      onSuccess();
      resetForm();
    }
  });

  // --- EFFECT: FILL DATA KHI VIEW/EDIT ---
  useEffect(() => {
    if (isOpen && existingTask) {
      setTaskName(existingTask.taskName || "");
      setDescription(existingTask.description || "");
      
      setTaskType((existingTask.taskType as TaskType) || "DRAFTING");
      setPriority((existingTask.priority as TaskPriority) || "MEDIUM");
      setStatus((existingTask.status as TaskStatus) || "OPEN");

      // [SỬA] Convert string deadline từ API sang Date object
      if (existingTask.deadline) {
        setDeadline(new Date(existingTask.deadline));
      } else {
        setDeadline(undefined);
      }

      const firstAssign = existingTask.assignments?.[0];
      setAssigneeId(firstAssign?.assignedUserId || existingTask.assigneeId || null);

    } else if (isOpen && !existingTask) {
      resetForm();
    }
  }, [isOpen, existingTask]);

  const resetForm = () => {
    setTaskName("");
    setDescription("");
    setTaskType("DRAFTING");
    setPriority("MEDIUM");
    setStatus("OPEN");
    setAssigneeId(null);
    setDeadline(undefined);
  };

  // --- ACTION: UPDATE ---
  const handleUpdate = async () => {
    if (!existingTask || !taskName.trim()) return;

    setIsUpdating(true);
    try {
      const assignmentsPayload = assigneeId 
        ? [
            {
              assignedUnitId: parentUnitId,
              assignedUserId: assigneeId,
              assignmentType: "MAIN",
              requiredRole: "SPECIALIST",
              requiredMinSecurity: 2,
              isAccepted: false
            }
          ]
        : [];

      const payload: Partial<CreateTaskDto> = {
        taskName,
        description,
        taskType,
        priority,
        status,
        // [SỬA] Convert Date -> ISO String
        deadline: deadline ? deadline.toISOString() : undefined,
        assigneeId: assigneeId, 
        assignments: assignmentsPayload as any, 
      };

      await taskApi.update(existingTask.id, payload);

      toast({ title: "Thành công", description: "Đã cập nhật công việc", className: "bg-green-600 text-white" });
      onSuccess(); 
      onClose();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể cập nhật công việc" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreate = () => {
    createSubtask({
      taskName,
      description,
      taskType,
      assigneeId,
      priority,
      // [SỬA] Convert Date -> ISO String
      deadline: deadline ? deadline.toISOString() : "" 
    });
  };

  if (!isOpen) return null;
  const isViewMode = !!existingTask;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[900px] max-w-[95vw] overflow-hidden flex flex-col h-[90vh] animate-in slide-in-from-bottom-4 duration-300 border border-slate-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
            {isViewMode ? `Cập nhật công việc #${existingTask.id}` : "Tạo công việc mới"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full">
             <X className="w-5 h-5" />
          </Button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 flex gap-8">
          {/* Main Content (Left) */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Tên việc */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Tên công việc <span className="text-red-500">*</span></Label>
              <Input 
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full font-medium text-slate-900 border-slate-200 focus:ring-[#009d98] focus:border-[#009d98]"
                placeholder="Nhập tên công việc..."
              />
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Mô tả chi tiết</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-slate-200 focus:ring-[#009d98] min-h-[120px] resize-none text-sm bg-slate-50/50 focus:bg-white transition-colors"
                placeholder="Mô tả yêu cầu công việc..."
              />
            </div>

            {/* Comment Section (Chỉ hiện khi Edit) */}
            {isViewMode && <TaskCommentSection taskId={existingTask.id} />}
          </div>

          {/* Sidebar Settings (Right) */}
          <div className="w-[300px] space-y-6 border-l border-slate-100 pl-8 shrink-0">
            
            {/* Status */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Trạng thái</Label>
              <Select 
                value={status} 
                onValueChange={(val) => setStatus(val as TaskStatus)} 
                disabled={!isViewMode}
              >
                <SelectTrigger className="w-full border-slate-200 bg-white h-10">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="OPEN">⚪ Mới (Open)</SelectItem>
                    <SelectItem value="ASSIGNED">🔵 Đã giao (Assigned)</SelectItem>
                    <SelectItem value="IN_PROGRESS">🚧 Đang làm (In Progress)</SelectItem>
                    <SelectItem value="PENDING_REVIEW">🟣 Chờ duyệt (Pending Review)</SelectItem>
                    <SelectItem value="COMPLETED">🟢 Hoàn thành (Completed)</SelectItem>
                    <SelectItem value="REJECTED">🔴 Từ chối (Rejected)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Người thực hiện</Label>
              <AssigneeSelect 
                unitId={parentUnitId}
                value={assigneeId}
                onChange={setAssigneeId}
                className="w-full"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Độ ưu tiên</Label>
              <Select 
                value={priority} 
                onValueChange={(val) => setPriority(val as TaskPriority)}
              >
                <SelectTrigger className="w-full border-slate-200 bg-white h-10">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="LOW">🔵 Thấp</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Trung bình</SelectItem>
                    <SelectItem value="HIGH">🔴 Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* [SỬA] Deadline với Calendar Popover */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Hạn chót</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal border-slate-200 h-10 hover:bg-slate-50",
                      !deadline && "text-slate-400"
                    )}
                  >
                    {deadline ? (
                      format(deadline, "dd/MM/yyyy")
                    ) : (
                      <span>Chọn ngày...</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    // 👇 CHẶN NGÀY QUÁ KHỨ
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Loại công việc</Label>
              <Select 
                value={taskType} 
                onValueChange={(val) => setTaskType(val as TaskType)}
              >
                <SelectTrigger className="w-full border-slate-200 bg-white h-10">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="DRAFTING">✍️ Soạn thảo</SelectItem>
                    <SelectItem value="SELECTION">📂 Chọn tài liệu</SelectItem>
                    <SelectItem value="AUTO">🤖 Tự động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-3 bg-slate-50/50 shrink-0">
          <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-600 hover:text-slate-800">
            Đóng
          </Button>
          
          {isViewMode ? (
             <Button 
               onClick={handleUpdate}
               disabled={isUpdating}
               className="bg-[#009d98] hover:bg-[#008580] text-white font-bold shadow-md"
             >
               {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
             </Button>
          ) : (
            <Button 
              onClick={handleCreate}
              disabled={isSubmitting || !taskName.trim()}
              className="bg-[#009d98] hover:bg-[#008580] text-white font-bold shadow-md"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo công việc"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};