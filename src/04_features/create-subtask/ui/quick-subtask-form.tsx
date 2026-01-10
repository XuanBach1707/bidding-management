"use client";

import { useState } from "react";
import { format } from "date-fns"; 
import { Calendar as CalendarIcon, Plus } from "lucide-react"; 
import { TaskType } from "@/entities/task";
import { AssigneeSelect } from "@/features/select-assignee";
import { useCreateSubtask } from "../model/use-create-subtask";

// Import các component UI của Shadcn
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/ui/select";

interface QuickSubtaskFormProps {
  parentId: number;
  biddingProjectId: number;
  parentUnitId: number;
  onSuccess: () => void;
}

export const QuickSubtaskForm = ({
  parentId,
  biddingProjectId,
  parentUnitId,
  onSuccess,
}: QuickSubtaskFormProps) => {
  // State form local
  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("DRAFTING");
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  // Logic validate: Chỉ cho phép submit khi có cả Tên và Nhân viên
  const canSubmit = taskName.trim().length > 0 && assigneeId !== null;
  
  // Trạng thái hiển thị lỗi cho AssigneeSelect (Khi gõ tên mà chưa chọn NV)
  const hasAssigneeError = taskName.trim().length > 0 && !assigneeId;

  const { createSubtask, isSubmitting } = useCreateSubtask({
    parentId,
    biddingProjectId,
    parentUnitId,
    onSuccess: () => {
      // Reset form sau khi tạo thành công
      setTaskName("");
      setAssigneeId(null);
      setDeadline(undefined); 
      onSuccess();
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Chỉ cho phép Enter khi đã thỏa mãn validate
    if (e.key === "Enter" && canSubmit && !isSubmitting) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    createSubtask({
      taskName,
      taskType,
      assigneeId,
      // Convert Date object sang string khi gửi API
      deadline: deadline ? deadline.toISOString() : "" 
    });
  };

  return (
    <div className="flex items-center gap-2 p-1.5 border border-dashed border-[#009d98]/30 rounded-lg bg-[#009d98]/5 mt-2 transition-all focus-within:bg-white focus-within:border-[#009d98] focus-within:shadow-sm">
      {/* Nút Plus + Input Name */}
      <div className="flex-1 flex items-center gap-2 pl-2">
        <Plus className="w-4 h-4 text-[#009d98]" strokeWidth={3} />
        <input
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-400 text-slate-700 h-9"
          placeholder="Nhập tên việc rồi Enter..."
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
      </div>

      {/* Select Type */}
      <div className="w-[140px]">
        <Select 
            value={taskType} 
            onValueChange={(val) => setTaskType(val as TaskType)}
            disabled={isSubmitting}
        >
            <SelectTrigger className="h-8 text-xs bg-white border-slate-200 focus:ring-0 focus:border-[#009d98]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="DRAFTING">✍️ Soạn thảo</SelectItem>
                <SelectItem value="SELECTION">📂 Chọn tài liệu</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {/* Select Assignee */}
      <div className="w-[180px]">
        <AssigneeSelect
          unitId={parentUnitId}
          value={assigneeId}
          onChange={setAssigneeId}
          className="h-8 text-xs"
          disabled={isSubmitting}
          placeholder="-- Chọn NV --"
          // Truyền prop error đã sửa ở file AssigneeSelect trước đó
          error={hasAssigneeError}
        />
      </div>

      {/* Date Picker với Calendar của Shadcn */}
      <div className="w-[130px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full h-8 px-2 text-xs justify-start text-left font-normal bg-white border-slate-200 hover:bg-slate-50",
                !deadline && "text-slate-400"
              )}
              disabled={isSubmitting}
            >
              <CalendarIcon className="mr-2 h-3 w-3 opacity-50" />
              {deadline ? (
                format(deadline, "dd/MM/yyyy")
              ) : (
                <span>Hạn chót</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={deadline}
              onSelect={setDeadline}
              // CHẶN NGÀY QUÁ KHỨ
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Action Button (Enter) */}
      <Button
        size="icon"
        onClick={handleSubmit}
        // Disabled khi đang submit hoặc chưa chọn xong (Tên + Nhân viên)
        disabled={isSubmitting || !canSubmit}
        className={cn(
          "h-8 w-8 shrink-0 rounded-md transition-all",
          canSubmit 
            ? "bg-[#009d98] hover:bg-[#008580] text-white" 
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        )}
        title={!canSubmit ? "Vui lòng nhập tên và chọn nhân viên" : "Tạo nhanh (Enter)"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </Button>
    </div>
  );
};