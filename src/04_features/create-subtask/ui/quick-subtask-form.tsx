import { useState } from "react";
import { format } from "date-fns"; // Import format ngày
import { Calendar as CalendarIcon } from "lucide-react"; // Import Icon
import { TaskType } from "@/entities/task";
import { AssigneeSelect } from "@/features/select-assignee";
import { useCreateSubtask } from "../model/use-create-subtask";

// Import các component UI của Shadcn
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

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
  
  // [SỬA] Đổi state deadline sang kiểu Date | undefined để dùng với Calendar
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const { createSubtask, isSubmitting } = useCreateSubtask({
    parentId,
    biddingProjectId,
    parentUnitId,
    onSuccess: () => {
      // Reset form sau khi tạo thành công
      setTaskName("");
      setAssigneeId(null);
      setDeadline(undefined); // Reset về undefined
      onSuccess();
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && taskName.trim()) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    createSubtask({
      taskName,
      taskType,
      assigneeId,
      // [SỬA] Convert Date object sang string khi gửi API
      deadline: deadline ? deadline.toISOString() : "" 
    });
  };

  return (
    <div className="flex items-center gap-2 p-2 border border-dashed border-blue-300 rounded-md bg-blue-50/30 mt-2">
      {/* Nút Plus + Input Name */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-blue-500 font-bold px-2">+</span>
        <input
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
          placeholder="Nhập tên việc rồi Enter..."
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
      </div>

      {/* Select Type */}
      <div className="w-[140px]">
        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value as TaskType)}
          className="w-full text-xs border rounded px-2 py-1 bg-white h-8 outline-none focus:border-blue-500"
          disabled={isSubmitting}
        >
          <option value="DRAFTING">✍️ Soạn thảo</option>
          <option value="SELECTION">📂 Chọn tài liệu</option>
        </select>
      </div>

      {/* Select Assignee */}
      <div className="w-[180px]">
        <AssigneeSelect
          unitId={parentUnitId}
          value={assigneeId}
          onChange={setAssigneeId}
          className="h-8 text-xs bg-white"
          placeholder="-- Chọn NV --"
          disabled={isSubmitting}
        />
      </div>

      {/* [SỬA] Date Picker với Calendar của Shadcn */}
      <div className="w-[130px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full h-8 px-2 text-xs justify-start text-left font-normal bg-white border-gray-200",
                !deadline && "text-muted-foreground"
              )}
              disabled={isSubmitting}
            >
              <CalendarIcon className="mr-2 h-3 w-3 text-gray-400" />
              {deadline ? (
                format(deadline, "dd/MM/yyyy")
              ) : (
                <span className="text-gray-400">Hạn chót</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={deadline}
              onSelect={setDeadline}
              // 👇 CHẶN NGÀY QUÁ KHỨ Ở ĐÂY
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Action Button (Enter) */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !taskName.trim()}
        className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        title="Tạo nhanh (Enter)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
    </div>
  );
};