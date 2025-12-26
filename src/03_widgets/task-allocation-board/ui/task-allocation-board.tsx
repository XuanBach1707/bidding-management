import { useState } from "react";
import { Task } from "@/entities/task";
import { QuickSubtaskForm, DetailSubtaskModal } from "@/features/create-subtask";

interface TaskAllocationBoardProps {
  parentTask: Task | null;
  onRefresh: () => void;
}

export const TaskAllocationBoard = ({ parentTask, onRefresh }: TaskAllocationBoardProps) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // [MỚI] State lưu subtask đang chọn để xem chi tiết
  const [selectedSubtask, setSelectedSubtask] = useState<Task | null>(null);

  // Hàm mở modal tạo mới
  const handleOpenCreateModal = () => {
    setSelectedSubtask(null); // Reset về null để modal hiểu là tạo mới
    setIsDetailModalOpen(true);
  };

  // Hàm mở modal xem chi tiết
  const handleOpenViewModal = (subtask: Task) => {
    setSelectedSubtask(subtask); // Set data để modal fill vào form
    setIsDetailModalOpen(true);
  };

  if (!parentTask) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50/50">
        <p>Chọn một đầu việc bên trái để phân bổ</p>
      </div>
    );
  }

  const parentUnitId = parentTask.assignments?.[0]?.assignedUnitId;

  if (!parentUnitId) {
    return (
      <div className="flex-1 p-8 text-red-500">
        Lỗi dữ liệu: Task cha này chưa được gán cho Phòng ban nào (Thiếu Unit ID).
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* HEADER */}
      <div className="px-6 py-4 border-b flex justify-between items-center bg-white shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Danh sách công việc</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gói thầu: <span className="font-medium text-blue-700">{parentTask.taskName}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {parentTask.subTasks?.length || 0} tasks
          </span>
          
          {/* NÚT TẠO CHI TIẾT -> Gọi handleOpenCreateModal */}
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo chi tiết
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-sm text-left border-separate border-spacing-y-1">
          <thead className="text-gray-500 font-medium">
            <tr>
              <th className="py-2 w-10 pl-2">#</th>
              <th className="py-2">Tên công việc</th>
              <th className="py-2 w-[150px]">Loại hình</th>
              <th className="py-2 w-[200px]">Người thực hiện</th>
              <th className="py-2 w-[150px]">Hạn chót</th>
            </tr>
          </thead>
          <tbody>
            {parentTask.subTasks?.map((subtask, index) => (
              <tr 
                key={subtask.id} 
                // [MỚI] Sự kiện Click vào dòng -> Mở chi tiết
                onClick={() => handleOpenViewModal(subtask)}
                className="hover:bg-blue-50 group bg-white border-b border-gray-100 cursor-pointer transition-colors"
              >
                <td className="py-3 pl-2 text-gray-400 border-t border-b border-gray-100 rounded-l-md">{index + 1}</td>
                <td className="py-3 font-medium text-gray-700 border-t border-b border-gray-100 group-hover:text-blue-700">
                  {subtask.taskName}
                </td>
                <td className="py-3 border-t border-b border-gray-100">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    subtask.taskType === "SELECTION" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {subtask.taskType === "SELECTION" ? "Chọn tài liệu" : "Soạn thảo"}
                  </span>
                </td>
                <td className="py-3 border-t border-b border-gray-100">
                   {subtask.assignments?.[0]?.assignedUserId ? (
                     <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                         {subtask.assignments[0].assignedUserId}
                       </div>
                       <span className="text-gray-600">User {subtask.assignments[0].assignedUserId}</span>
                     </div>
                   ) : (
                     <span className="text-gray-300 italic text-xs">-- Chưa gán --</span>
                   )}
                </td>
                <td className="py-3 text-gray-500 border-t border-b border-gray-100 rounded-r-md">
                  {subtask.deadline ? new Date(subtask.deadline).toLocaleDateString("vi-VN") : "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FORM TẠO NHANH */}
        <QuickSubtaskForm 
          parentId={parentTask.id}
          biddingProjectId={parentTask.biddingProjectId}
          parentUnitId={parentUnitId}
          onSuccess={onRefresh}
        />
      </div>

      {/* MODAL (DÙNG CHUNG CHO CẢ TẠO VÀ XEM) */}
      <DetailSubtaskModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        parentId={parentTask.id}
        biddingProjectId={parentTask.biddingProjectId}
        parentUnitId={parentUnitId}
        onSuccess={onRefresh}
        // [MỚI] Truyền task đang chọn vào modal
        existingTask={selectedSubtask}
      />
    </div>
  );
};