import { Calendar, User, AlignLeft } from "lucide-react";
import { Task } from "@/entities/task";
import { StatusSelect } from "@/features/task/update-status";
import { DiscussionThread } from "@/features/comment/discussion-thread";

interface GeneralTabProps {
  task: Task;
}

export const GeneralTab = ({ task }: GeneralTabProps) => {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
      
      {/* SECTION 1: Meta Info & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border shadow-sm">
        
        {/* Cột trái: Thông tin cơ bản */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
             </div>
             <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Người thực hiện</p>
                {/* Logic hiển thị người được gán: Ưu tiên hiển thị tên người dùng hiện tại nếu API đã filter assigned */}
                <p className="text-sm font-semibold text-gray-900">
                  {/* Tạm thời để hardcode hoặc lấy từ user assignments nếu có */}
                  Tôi (Assigned to Me)
                </p>
             </div>
          </div>

          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-orange-600" />
             </div>
             <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Hạn chót</p>
                <p className="text-sm font-semibold text-gray-900">
                   {task.deadline 
                     ? new Date(task.deadline).toLocaleDateString("vi-VN", { dateStyle: 'full' }) 
                     : "Không có thời hạn"}
                </p>
             </div>
          </div>
        </div>

        {/* Cột phải: Trạng thái & Hành động */}
        <div className="flex flex-col items-end justify-between">
           <div className="text-right">
              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Trạng thái hiện tại</p>
              <StatusSelect 
                taskId={task.id} 
                currentStatus={task.status} 
              />
           </div>
        </div>
      </div>

      {/* SECTION 2: Mô tả công việc */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 mb-3 border-b pb-2">
           <AlignLeft className="w-4 h-4 text-gray-500" />
           <h3 className="text-sm font-bold text-gray-800 uppercase">Mô tả chi tiết</h3>
        </div>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[100px]">
           {task.description || "Không có mô tả cho công việc này."}
        </div>
      </div>

      {/* SECTION 3: Trao đổi / Bình luận */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
         <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 border-b pb-2">Thảo luận công việc</h3>
         <DiscussionThread taskId={task.id} />
      </div>

    </div>
  );
};