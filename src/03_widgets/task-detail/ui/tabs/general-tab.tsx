import { 
  Calendar, 
  User as UserIcon, 
  CloudUpload, 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon, 
  Paperclip
} from "lucide-react";
import { Task, TaskPriority } from "@/entities/task";
import { StatusSelect } from "@/features/task/update-status";
import { DiscussionThread } from "@/features/comment/discussion-thread";
import { cn } from "@/shared/lib/utils";

interface GeneralTabProps {
  task: Task;
}

// Helper: Map Priority sang text hiển thị và màu chấm tròn
const getPriorityDisplay = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH:
      return { label: "Cao (High)", color: "bg-red-500" };
    case TaskPriority.MEDIUM:
      return { label: "Trung bình (Medium)", color: "bg-blue-500" };
    case TaskPriority.LOW:
      return { label: "Thấp (Low)", color: "bg-gray-500" };
    default:
      return { label: priority, color: "bg-gray-400" };
  }
};

export const GeneralTab = ({ task }: GeneralTabProps) => {
  // Lấy cấu hình hiển thị priority
  const priorityInfo = getPriorityDisplay(task.priority);
  
  // Lấy người thực hiện chính (Assignee)
  const mainAssignee = task.assignments?.find(a => a.assignmentType === "MAIN")?.user;

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ================= CỘT TRÁI (Nội dung chính - Chiếm 2 phần) ================= */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. TÊN CÔNG VIỆC */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Tên công việc <span className="text-red-500">*</span>
            </label>
            {/* Hiển thị dữ liệu thật trong khung giống input */}
            <div className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 font-medium shadow-sm">
              {task.taskName}
            </div>
          </div>

          {/* 2. MÔ TẢ CHI TIẾT (Có Fake Toolbar) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Mô tả chi tiết
            </label>
            <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
              {/* FAKE TOOLBAR (Chỉ để làm cảnh cho giống Editor) */}
              <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
                <div className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><Bold className="w-4 h-4" /></div>
                <div className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><Italic className="w-4 h-4" /></div>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <div className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><List className="w-4 h-4" /></div>
                <div className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><LinkIcon className="w-4 h-4" /></div>
              </div>
              
              {/* CONTENT AREA (Dữ liệu thật) */}
              <div className="p-4 min-h-[160px] text-sm text-gray-700 leading-relaxed">
                 {task.description ? (
                   <div className="whitespace-pre-wrap">{task.description}</div>
                 ) : (
                   <span className="text-gray-400 italic">Chưa có mô tả...</span>
                 )}
              </div>
            </div>
          </div>

          {/* 3. ĐÍNH KÈM (Giữ UI Mock upload) */}
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Đính kèm
            </label>
            
            {/* Vẫn render list file thật nếu có */}
            {task.attachmentUrl && task.attachmentUrl.length > 0 ? (
                <div className="space-y-2 mb-3">
                    {task.attachmentUrl.map((url, idx) => (
                        <div key={idx} className="flex items-center p-3 border rounded-md bg-white hover:bg-blue-50 transition-colors">
                            <Paperclip className="w-4 h-4 text-blue-500 mr-2" />
                            <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex-1 truncate">
                                {url.split('/').pop() || `Tài liệu ${idx + 1}`}
                            </a>
                        </div>
                    ))}
                </div>
            ) : null}

            {/* Mock Upload Area (Luôn hiển thị để user biết chỗ kéo thả) */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                <CloudUpload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                    <span className="text-blue-600 font-semibold">Chọn file</span> hoặc kéo thả vào đây
                </p>
            </div>
          </div>

          {/* 4. TRAO ĐỔI / BÌNH LUẬN */}
          <div className="pt-4">
             <div className="flex items-center gap-2 mb-4">
                 <h3 className="text-xs font-bold text-gray-500 uppercase">Trao đổi / Bình luận</h3>
             </div>
             <div className="border rounded-lg bg-white p-4 shadow-sm">
                <DiscussionThread taskId={task.id} />
             </div>
          </div>

        </div>

        {/* ================= CỘT PHẢI (Meta Info - Chiếm 1 phần) ================= */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* 1. TRẠNG THÁI (Cái này vẫn cần thao tác nên giữ StatusSelect) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Trạng thái
            </label>
            <StatusSelect 
               taskId={task.id} 
               currentStatus={task.status} 
            />
          </div>

          {/* 2. NGƯỜI THỰC HIỆN (Read-only, Không mũi tên) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Người thực hiện
            </label>
            <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center gap-2 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    {mainAssignee?.avatarUrl ? (
                      <img src={mainAssignee.avatarUrl} alt="avt" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5" />
                    )}
                </div>
                <span className="text-sm text-gray-700 font-medium truncate flex-1">
                    {mainAssignee?.fullName || "Chưa phân công"}
                </span>
            </div>
          </div>

          {/* 3. ĐỘ ƯU TIÊN (Read-only, Không mũi tên) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Độ ưu tiên
            </label>
            <div className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md flex items-center gap-2 shadow-sm">
                {/* Dùng chấm tròn màu như bạn yêu cầu */}
                <div className={cn("w-2.5 h-2.5 rounded-full", priorityInfo.color)} />
                <span className="text-sm text-gray-700 font-medium">
                    {priorityInfo.label}
                </span>
            </div>
          </div>

          {/* 4. HẠN CHÓT (Read-only, Không mũi tên) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Hạn chót
            </label>
            <div className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md flex items-center justify-between shadow-sm">
                <span className="text-sm text-gray-700 font-medium">
                    {task.deadline 
                        ? new Date(task.deadline).toLocaleDateString("vi-VN") 
                        : "--/--/----"}
                </span>
                <Calendar className="w-4 h-4 text-gray-400" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};