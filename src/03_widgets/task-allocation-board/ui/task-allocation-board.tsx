import { useState } from "react";
import { Task } from "@/entities/task";
import { QuickSubtaskForm, DetailSubtaskModal } from "@/features/create-subtask";
import { Briefcase, FolderOpen, Layers, Plus, Calendar, User, Clock, CheckSquare } from "lucide-react"; 
import { Button } from "@/shared/ui/button"; 
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

  // --- 1. EMPTY STATE ---
  if (!parentTask) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 h-full p-6 text-center">
        <div className="w-16 h-16 bg-white rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
            <Layers className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-lg font-bold text-slate-700">Chưa chọn đầu việc</p>
        <p className="text-sm mt-1">Vui lòng chọn một nhiệm vụ từ danh sách để phân bổ.</p>
      </div>
    );
  }

  const parentUnitId = parentTask.assignments?.[0]?.assignedUnitId;

  if (!parentUnitId) {
    return (
      <div className="flex-1 p-8 text-red-600 bg-red-50 flex items-center justify-center font-medium text-center">
        Lỗi dữ liệu: Task cha này chưa được gán cho Phòng ban nào (Thiếu Unit ID).
      </div>
    );
  }

  // Helper render Assignee (Dùng chung cho cả Mobile Card và Desktop Table)
  const renderAssignee = (subtask: Task) => {
    const assignment = subtask.assignments?.[0];
    const hasAssignee = !!assignment?.assignedUserId;
    const displayName = assignment?.user?.fullName || (hasAssignee ? `User ${assignment.assignedUserId}` : "-- Chưa gán --");
    const avatarChar = displayName !== "-- Chưa gán --" ? displayName.charAt(0).toUpperCase() : "?";

    if (hasAssignee) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#009d98]/10 text-[#009d98] border border-[#009d98]/20 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {avatarChar}
                </div>
                <span className="text-slate-700 text-sm truncate max-w-[150px] font-medium">
                    {displayName}
                </span>
            </div>
        );
    }
    return (
        <div className="text-slate-400 text-xs flex items-center gap-1.5 italic">
            <div className="w-6 h-6 rounded border border-dashed border-slate-300 flex items-center justify-center">
                <User className="w-3 h-3" />
            </div>
            Chưa gán
        </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      
      {/* --- 2. HEADER: Responsive (Flex-col mobile -> Flex-row desktop) --- */}
      <div className="px-4 py-4 md:px-6 md:py-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white z-10 shrink-0">
        <div className="flex-1 min-w-0 w-full">
          {/* Tên Đầu việc cha */}
          <div className="flex items-start gap-3 mb-2 md:mb-1.5">
             <div className="p-2 bg-[#009d98]/10 text-[#009d98] rounded-lg shrink-0 mt-0.5 md:mt-0">
                <Layers className="w-5 h-5" />
             </div>
             <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug md:truncate line-clamp-2 md:line-clamp-1" title={parentTask.taskName}>
                  {parentTask.taskName}
                </h1>
                
                {/* Tên Dự án (Mobile xuống dòng) */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm text-slate-500 mt-1">
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span className="shrink-0">Dự án:</span>
                    <span className="font-bold text-[#009d98] truncate max-w-[200px] md:max-w-[400px]">
                      {parentTask.projectName || "---"}
                    </span>
                </div>
             </div>
          </div>
        </div>
        
        {/* Nút Action */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6 mt-2 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div className="flex items-center gap-2">
             <div className="text-xs font-medium text-slate-400 uppercase tracking-wide md:hidden">Số lượng việc:</div>
             <div className="text-lg md:text-2xl font-bold text-slate-800 leading-none">{parentTask.subTasks?.length || 0}</div>
             <div className="hidden md:block text-xs font-medium text-slate-400 uppercase tracking-wide text-right ml-2">Việc<br/>chi tiết</div>
          </div>
          
          <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

          <Button 
            onClick={handleOpenCreateModal}
            className="flex-1 md:flex-none bg-[#009d98] hover:bg-[#008580] text-white shadow-md font-bold gap-2 h-10"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Tạo chi tiết
          </Button>
        </div>
      </div>

      {/* --- 3. CONTENT AREA --- */}
      <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50/50 custom-scrollbar">
        
        {/* VIEW 1: DESKTOP TABLE (Ẩn trên mobile) */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
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
                           {renderAssignee(subtask)}
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

        {/* VIEW 2: MOBILE CARD LIST (Chỉ hiện trên mobile) */}
        <div className="md:hidden space-y-3 mb-6">
            {parentTask.subTasks?.length === 0 ? (
                <div className="py-10 text-center text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
                    <FolderOpen className="w-8 h-8 opacity-30 mx-auto mb-2" />
                    <p className="text-sm">Chưa có công việc chi tiết.</p>
                </div>
            ) : (
                parentTask.subTasks?.map((subtask, index) => (
                    <div 
                        key={subtask.id}
                        onClick={() => handleOpenViewModal(subtask)}
                        className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm active:scale-[0.98] transition-transform"
                    >
                        <div className="flex justify-between items-start gap-3 mb-2">
                             <div className="flex-1">
                                 <span className="text-xs font-mono text-slate-400 mb-1 block">#{index + 1}</span>
                                 <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
                                     {subtask.taskName}
                                 </h3>
                             </div>
                             <span className={cn(
                               "shrink-0 px-2 py-1 rounded text-[10px] font-bold border uppercase",
                               subtask.taskType === "SELECTION" 
                               ? "bg-blue-50 text-blue-700 border-blue-100" 
                               : "bg-purple-50 text-purple-700 border-purple-100"
                           )}>
                               {subtask.taskType === "SELECTION" ? "Chọn" : "Soạn"}
                           </span>
                        </div>
                        
                        <div className="border-t border-slate-50 my-2 pt-2 space-y-2">
                            <div className="flex items-center justify-between">
                                {renderAssignee(subtask)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Hạn chót: </span>
                                <span className="font-medium text-slate-700">
                                    {subtask.deadline ? new Date(subtask.deadline).toLocaleDateString("vi-VN") : "--/--/----"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* FORM TẠO NHANH */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm md:sticky md:bottom-0">
             <div className="mb-3 text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5" /> Thêm nhanh công việc
             </div>
             {/* Component Form này cần đảm bảo input bên trong có w-full */}
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