import { useState } from "react";
import { Task } from "@/entities/task";
import { QuickSubtaskForm, DetailSubtaskModal } from "@/features/create-subtask";
import { Briefcase, FolderOpen, Layers, Plus, Calendar, User } from "lucide-react"; 
import { Button } from "@/shared/ui/button"; // Sử dụng Button Shadcn
import { cn } from "@/shared/lib/utils";

interface TaskAllocationBoardProps {
  parentTask: Task | null;
  onRefresh: () => void;
}

export const TaskAllocationBoard = ({ parentTask, onRefresh }: TaskAllocationBoardProps) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState<Task | null>(null);

  const handleOpenCreateModal = () => {
    setSelectedSubtask(null);
    setIsDetailModalOpen(true);
  };

  const handleOpenViewModal = (subtask: Task) => {
    setSelectedSubtask(subtask);
    setIsDetailModalOpen(true);
  };

  if (!parentTask) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 h-full">
        <div className="w-16 h-16 bg-white rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
            <Layers className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-lg font-bold text-slate-700">Chưa chọn đầu việc</p>
        <p className="text-sm mt-1">Vui lòng chọn một nhiệm vụ từ danh sách bên trái để phân bổ.</p>
      </div>
    );
  }

  const parentUnitId = parentTask.assignments?.[0]?.assignedUnitId;

  if (!parentUnitId) {
    return (
      <div className="flex-1 p-8 text-red-600 bg-red-50 flex items-center justify-center font-medium">
        Lỗi dữ liệu: Task cha này chưa được gán cho Phòng ban nào (Thiếu Unit ID).
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-start bg-white z-10">
        <div className="flex-1 min-w-0 mr-4">
          {/* Tên Đầu việc cha */}
          <div className="flex items-center gap-3 mb-1.5">
             <div className="p-2 bg-[#009d98]/10 text-[#009d98] rounded-lg">
                <Layers className="w-5 h-5" />
             </div>
             <h1 className="text-xl font-extrabold text-slate-900 truncate" title={parentTask.taskName}>
                {parentTask.taskName}
             </h1>
          </div>
          
          {/* Tên Dự án đầy đủ */}
          <div className="flex items-center gap-2 text-sm text-slate-500 pl-1" title={parentTask.projectName}>
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="shrink-0">Thuộc dự án:</span>
            <span className="font-bold text-[#009d98] truncate block max-w-[600px]">
              {parentTask.projectName || "---"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 shrink-0 mt-1">
          <div className="text-right hidden xl:block">
             <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Việc chi tiết</div>
             <div className="text-2xl font-bold text-slate-800 leading-none mt-0.5">{parentTask.subTasks?.length || 0}</div>
          </div>
          
          <div className="h-10 w-px bg-slate-200 hidden xl:block"></div>

          <Button 
            onClick={handleOpenCreateModal}
            className="bg-[#009d98] hover:bg-[#008580] text-white shadow-md font-bold gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Tạo chi tiết
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Tên công việc</th>
                  <th className="px-6 py-4 w-[150px]">Loại hình</th>
                  <th className="px-6 py-4 w-[240px]">Người thực hiện</th>
                  <th className="px-6 py-4 w-[140px]">Hạn chót</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {parentTask.subTasks?.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="py-16 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                                    <FolderOpen className="w-6 h-6 opacity-30 text-slate-500" />
                                </div>
                                <span>Chưa có công việc chi tiết nào.</span>
                            </div>
                        </td>
                    </tr>
                ) : (
                    parentTask.subTasks?.map((subtask, index) => (
                    <tr 
                        key={subtask.id} 
                        onClick={() => handleOpenViewModal(subtask)}
                        className="hover:bg-[#009d98]/5 group bg-white cursor-pointer transition-colors"
                    >
                        <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                        
                        <td className="px-6 py-4 font-bold text-slate-700 group-hover:text-[#009d98] transition-colors">
                           {subtask.taskName}
                        </td>
                        
                        <td className="px-6 py-4">
                           <span className={cn(
                               "inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold border uppercase tracking-wide",
                               subtask.taskType === "SELECTION" 
                               ? "bg-blue-50 text-blue-700 border-blue-100" 
                               : "bg-purple-50 text-purple-700 border-purple-100"
                           )}>
                               {subtask.taskType === "SELECTION" ? "Chọn tài liệu" : "Soạn thảo"}
                           </span>
                        </td>
                        
                        <td className="px-6 py-4">
                        {(() => {
                            const assignment = subtask.assignments?.[0];
                            const hasAssignee = !!assignment?.assignedUserId;
                            const displayName = assignment?.user?.fullName || (hasAssignee ? `User ${assignment.assignedUserId}` : "-- Chưa gán --");
                            const avatarChar = displayName !== "-- Chưa gán --" ? displayName.charAt(0).toUpperCase() : "?";

                            if (hasAssignee) {
                            return (
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded bg-[#009d98]/10 text-[#009d98] border border-[#009d98]/20 flex items-center justify-center text-xs font-bold shrink-0">
                                        {avatarChar}
                                    </div>
                                    <span className="text-slate-700 text-sm truncate max-w-[160px] font-medium" title={displayName}>
                                        {displayName}
                                    </span>
                                </div>
                            );
                            } else {
                            return (
                                <div className="text-slate-400 text-xs flex items-center gap-2 italic">
                                    <div className="w-7 h-7 rounded border border-dashed border-slate-300 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                    Chưa gán
                                </div>
                            );
                            }
                        })()}
                        </td>

                        <td className="px-6 py-4 text-slate-500 font-mono text-xs flex items-center gap-2 h-full">
                           <Calendar className="w-3.5 h-3.5 opacity-50" />
                           {subtask.deadline ? new Date(subtask.deadline).toLocaleDateString("vi-VN") : "--/--/----"}
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
        </div>

        {/* FORM TẠO NHANH */}
        <div className="mt-6 bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
             <div className="mb-3 text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Thêm nhanh công việc
             </div>
             <QuickSubtaskForm 
                parentId={parentTask.id}
                biddingProjectId={parentTask.biddingProjectId}
                parentUnitId={parentUnitId}
                onSuccess={onRefresh}
            />
        </div>
      </div>

      <DetailSubtaskModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        parentId={parentTask.id}
        biddingProjectId={parentTask.biddingProjectId}
        parentUnitId={parentUnitId}
        onSuccess={onRefresh}
        existingTask={selectedSubtask}
      />
    </div>
  );
};