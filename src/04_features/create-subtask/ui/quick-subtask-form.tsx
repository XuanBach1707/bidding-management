import { useState } from "react";
import { TaskType } from "@/entities/task";
import { AssigneeSelect } from "@/features/select-assignee";
import { useCreateSubtask } from "../model/use-create-subtask";

interface QuickSubtaskFormProps {
  parentId: number;
  biddingProjectId: number;
  parentUnitId: number;
  onSuccess: () => void;
  // Đã xóa onOpenDetail vì không còn dùng ở đây nữa
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
  const [deadline, setDeadline] = useState("");

  const { createSubtask, isSubmitting } = useCreateSubtask({
    parentId,
    biddingProjectId,
    parentUnitId,
    onSuccess: () => {
      // Reset form sau khi tạo thành công
      setTaskName("");
      setAssigneeId(null);
      setDeadline("");
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
      deadline
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
          className="w-full text-xs border rounded px-2 py-1 bg-white h-8 outline-none"
          disabled={isSubmitting}
        >
          <option value="DRAFTING">✍️ Soạn thảo</option>
          <option value="SELECTION">📂 Chọn tài liệu</option>
        </select>
      </div>

      {/* Select Assignee (Feature Select Assignee) */}
      <div className="w-[180px]">
        <AssigneeSelect
          unitId={parentUnitId}
          value={assigneeId}
          onChange={setAssigneeId}
          className="h-8 text-xs"
          placeholder="-- Chọn NV --"
          disabled={isSubmitting}
        />
      </div>

      {/* Date Picker */}
      <input
        type="date"
        className="w-[130px] text-xs border rounded px-2 py-1 h-8 bg-white outline-none"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        disabled={isSubmitting}
      />

      {/* Action Button (Enter) */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !taskName.trim()}
        className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
        title="Tạo nhanh (Enter)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
    </div>
  );
};