import { useState } from "react";
import { Task } from "@/entities/task";
import { QuickSubtaskForm, DetailSubtaskModal } from "@/features/create-subtask";
import { Briefcase, FolderOpen, Layers } from "lucide-react"; // Import thêm Icon cho đẹp

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
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 h-full">
        <Layers className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">Chưa chọn đầu việc</p>
        <p className="text-sm">Vui lòng chọn một nhiệm vụ từ danh sách bên trái để phân bổ.</p>
      </div>
    );
  }

  const parentUnitId = parentTask.assignments?.[0]?.assignedUnitId;

  if (!parentUnitId) {
    return (
      <div className="flex-1 p-8 text-red-500 flex items-center justify-center">
        Lỗi dữ liệu: Task cha này chưa được gán cho Phòng ban nào (Thiếu Unit ID).
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* HEADER */}
      <div className="px-6 py-5 border-b flex justify-between items-start bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] z-10">
        <div className="flex-1 min-w-0 mr-4">
          {/* Tên Đầu việc cha (VD: Hồ sơ nhân sự) */}
          <div className="flex items-center gap-2 mb-1">
             <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
                <Layers className="w-5 h-5" />
             </div>
             <h1 className="text-xl font-bold text-gray-800 truncate" title={parentTask.taskName}>
                {parentTask.taskName}
             </h1>
          </div>
          
          {/* Tên Dự án đầy đủ */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500" title={parentTask.projectName}>
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="shrink-0">Thuộc dự án:</span>
            <span className="font-medium text-blue-700 truncate block max-w-[600px]">
              {parentTask.projectName || "---"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 shrink-0 mt-1">
          <div className="text-right hidden xl:block">
             <div className="text-xs text-gray-400">Số lượng việc con</div>
             <div className="text-lg font-bold text-gray-700 leading-none">{parentTask.subTasks?.length || 0}</div>
          </div>
          
          <div className="h-8 w-px bg-gray-200 hidden xl:block mx-2"></div>

          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo chi tiết
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50/30">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-semibold w-12 text-center">#</th>
                  <th className="px-6 py-3 font-semibold">Tên công việc</th>
                  <th className="px-6 py-3 font-semibold w-[140px]">Loại hình</th>
                  <th className="px-6 py-3 font-semibold w-[220px]">Người thực hiện</th>
                  <th className="px-6 py-3 font-semibold w-[140px]">Hạn chót</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {parentTask.subTasks?.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <FolderOpen className="w-8 h-8 opacity-20" />
                                <span>Chưa có công việc chi tiết nào.</span>
                            </div>
                        </td>
                    </tr>
                ) : (
                    parentTask.subTasks?.map((subtask, index) => (
                    <tr 
                        key={subtask.id} 
                        onClick={() => handleOpenViewModal(subtask)}
                        className="hover:bg-blue-50/60 group bg-white cursor-pointer transition-colors"
                    >
                        <td className="px-6 py-4 text-center text-gray-400">{index + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-700 group-hover:text-blue-700">
                        {subtask.taskName}
                        </td>
                        <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            subtask.taskType === "SELECTION" 
                            ? "bg-blue-50 text-blue-700 border-blue-100" 
                            : "bg-purple-50 text-purple-700 border-purple-100"
                        }`}>
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
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border border-blue-200 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                                    {avatarChar}
                                </div>
                                <span className="text-gray-700 text-sm truncate max-w-[160px]" title={displayName}>
                                    {displayName}
                                </span>
                                </div>
                            );
                            } else {
                            return <span className="text-gray-400 italic text-xs flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300"></span> Chưa gán</span>;
                            }
                        })()}
                        </td>

                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                        {subtask.deadline ? new Date(subtask.deadline).toLocaleDateString("vi-VN") : "--/--/----"}
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
        </div>

        {/* FORM TẠO NHANH */}
        <div className="mt-6">
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