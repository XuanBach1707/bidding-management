import { useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { TaskStatus, taskApi, TaskStatusEnum } from "@/entities/task";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"; // Giả sử có component Dropdown
import { Button } from "@/shared/ui/button";

interface StatusSelectProps {
  taskId: number;
  currentStatus: TaskStatus;
  onChange?: (newStatus: TaskStatus) => void;
}

// Map màu sắc cho từng status
const statusColors: Record<string, string> = {
  OPEN: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  ASSIGNED: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  PENDING_REVIEW: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  COMPLETED: "bg-green-100 text-green-700 hover:bg-green-200",
  REJECTED: "bg-red-100 text-red-700 hover:bg-red-200",
};

export const StatusSelect = ({ taskId, currentStatus, onChange }: StatusSelectProps) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleUpdate = async (newStatus: TaskStatus) => {
    if (newStatus === status) return;
    try {
      setLoading(true);
      // Gọi API cập nhật
      await taskApi.updateStatus(taskId, newStatus);
      setStatus(newStatus);
      onChange?.(newStatus);
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      // Có thể thêm toast error ở đây
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          disabled={loading}
          className={cn("h-8 text-xs font-bold border", statusColors[status])}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
          {status}
          <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        {Object.values(TaskStatusEnum.enum).map((s) => (
          <DropdownMenuItem 
            key={s} 
            onClick={() => handleUpdate(s)}
            className="flex items-center justify-between text-xs font-medium cursor-pointer"
          >
            {s}
            {s === status && <Check className="w-3 h-3 text-blue-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};