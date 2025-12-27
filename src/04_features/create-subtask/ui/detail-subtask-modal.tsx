import { useState, useEffect } from "react";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { 
  taskApi, 
  Task, 
  // Import Types & Enums chuẩn từ file types bạn gửi
  TaskType, 
  TaskPriority, 
  TaskStatus,
  CreateTaskDto 
} from "@/entities/task"; 
import { AssigneeSelect } from "@/features/select-assignee";
import { TaskCommentSection } from "@/features/task-comment";
import { useCreateSubtask } from "../model/use-create-subtask";

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
  // Sử dụng Enum chuẩn cho giá trị mặc định
  const [taskType, setTaskType] = useState<TaskType>("DRAFTING");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("OPEN");
  
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [deadline, setDeadline] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);

  // Logic Create (Hook cũ)
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
      
      // Cast type an toàn từ response về Enum
      setTaskType((existingTask.taskType as TaskType) || "DRAFTING");
      setPriority((existingTask.priority as TaskPriority) || "MEDIUM");
      setStatus((existingTask.status as TaskStatus) || "OPEN");

      if (existingTask.deadline) {
        setDeadline(existingTask.deadline.split("T")[0]);
      } else {
        setDeadline("");
      }

      // Lấy người được gán đầu tiên (nếu có)
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
    setDeadline("");
  };

  // --- ACTION: UPDATE ---
  const handleUpdate = async () => {
    if (!existingTask || !taskName.trim()) return;

    setIsUpdating(true);
    try {
      // 1. Cấu trúc Assignments theo Schema
      const assignmentsPayload = assigneeId 
        ? [
            {
              assignedUnitId: parentUnitId,
              assignedUserId: assigneeId,
              assignmentType: "MAIN",        // Khớp AssignmentTypeEnum
              requiredRole: "SPECIALIST",    // Khớp UserRoleEnum
              requiredMinSecurity: 2,
              isAccepted: false
            }
          ]
        : []; // Rỗng = Xóa assignment cũ

      // 2. Payload chuẩn theo UpdateTaskDto
      const payload: Partial<CreateTaskDto> = {
        taskName,
        description,
        taskType,
        priority,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        assigneeId: assigneeId, // Cập nhật cả field lẻ này cho chắc
        assignments: assignmentsPayload as any, // Ép kiểu vì assignments trong DTO là array object
      };

      await taskApi.update(existingTask.id, payload);

      toast({ title: "Thành công", description: "Đã cập nhật công việc" });
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
    // Gọi hook createSubtask (đã có từ trước)
    // Lưu ý: Hook này cũng cần cập nhật để truyền đúng TaskType enum
    createSubtask({
      taskName,
      description,
      taskType,
      assigneeId,
      priority,
      deadline
    });
  };

  if (!isOpen) return null;
  const isViewMode = !!existingTask;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[900px] max-w-[95vw] overflow-hidden flex flex-col h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {isViewMode ? `Cập nhật công việc #${existingTask.id}` : "Tạo công việc mới"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 flex gap-6">
          <div className="flex-1 flex flex-col gap-4">
            {/* Tên việc */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">TÊN CÔNG VIỆC <span className="text-red-500">*</span></label>
              <input 
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">MÔ TẢ CHI TIẾT</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-md p-2 outline-none text-sm min-h-[100px] resize-none"
              />
            </div>

            {/* Comment Section */}
            {isViewMode && <TaskCommentSection taskId={existingTask.id} />}
          </div>

          {/* SIDEBAR SETTINGS */}
          <div className="w-[300px] space-y-4 border-l pl-6 shrink-0">
            
            {/* Status (Dùng Enum Value) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">TRẠNG THÁI</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full border rounded p-2 text-sm bg-white"
                disabled={!isViewMode}
              >
                <option value="OPEN">⚪ Mới (Open)</option>
                <option value="ASSIGNED">🔵 Đã giao (Assigned)</option>
                <option value="IN_PROGRESS">🚧 Đang làm (In Progress)</option>
                <option value="PENDING_REVIEW">🟣 Chờ duyệt (Pending Review)</option>
                <option value="COMPLETED">🟢 Hoàn thành (Completed)</option>
                <option value="REJECTED">🔴 Từ chối (Rejected)</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">NGƯỜI THỰC HIỆN</label>
              <AssigneeSelect 
                unitId={parentUnitId}
                value={assigneeId}
                onChange={setAssigneeId}
                className="w-full"
              />
            </div>

            {/* Priority (Dùng Enum Value) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">ĐỘ ƯU TIÊN</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full border rounded p-2 text-sm bg-white"
              >
                <option value="LOW">🔵 Thấp</option>
                <option value="MEDIUM">🟡 Trung bình</option>
                <option value="HIGH">🔴 Cao</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">HẠN CHÓT</label>
              <input 
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border rounded p-2 text-sm" 
              />
            </div>

            {/* Task Type (Dùng Enum Value) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">LOẠI CÔNG VIỆC</label>
              <select 
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full border rounded p-2 text-sm bg-white"
              >
                <option value="DRAFTING">✍️ Soạn thảo</option>
                <option value="SELECTION">📂 Chọn tài liệu</option>
                <option value="AUTO">🤖 Tự động</option>
              </select>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            Đóng
          </button>
          
          {isViewMode ? (
             <button 
               onClick={handleUpdate}
               disabled={isUpdating}
               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
             >
               {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
             </button>
          ) : (
            <button 
              onClick={handleCreate}
              disabled={isSubmitting || !taskName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo công việc"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};