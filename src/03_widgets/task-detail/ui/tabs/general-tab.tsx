"use client";

import { useState } from "react";
import { 
  Calendar, 
  User as UserIcon, 
  Users as UsersIcon,
  CloudUpload, 
  Bold, 
  Italic, 
  List, 
  Paperclip,
  Send,      
  Loader2,
  CheckCircle, // [MỚI] Icon Duyệt
  XCircle      // [MỚI] Icon Từ chối
} from "lucide-react";
import { Task, TaskPriority, taskApi } from "@/entities/task";
import { DiscussionThread } from "@/features/comment/discussion-thread";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button"; 
import { useToast } from "@/shared/lib/hooks/use-toast"; 
import { Textarea } from "@/shared/ui/textarea"; // [MỚI]
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"; // [MỚI]

interface GeneralTabProps {
  task: Task;
  onRefresh: () => void;
  isReviewMode?: boolean; // <--- [MỚI] Cờ đánh dấu chế độ Duyệt
}

// Helper: Map Priority
const getPriorityDisplay = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH: return { label: "Cao (High)", color: "bg-red-500" };
    case TaskPriority.MEDIUM: return { label: "Trung bình (Medium)", color: "bg-blue-500" };
    case TaskPriority.LOW: return { label: "Thấp (Low)", color: "bg-gray-500" };
    default: return { label: priority || "Không có", color: "bg-gray-400" };
  }
};

// Helper: Map Status Badge
const getStatusBadge = (status: string) => {
    switch (status) {
        case "OPEN": return { label: "Mới tạo", bg: "bg-gray-100 text-gray-700 border-gray-200" };
        case "IN_PROGRESS": return { label: "Đang thực hiện", bg: "bg-blue-100 text-blue-700 border-blue-200" };
        case "PENDING_REVIEW": return { label: "Chờ duyệt", bg: "bg-orange-100 text-orange-700 border-orange-200" };
        case "COMPLETED": return { label: "Hoàn thành", bg: "bg-green-100 text-green-700 border-green-200" };
        case "REJECTED": return { label: "Đã từ chối", bg: "bg-red-100 text-red-700 border-red-200" }; // [MỚI] Thêm trạng thái Rejected
        default: return { label: status, bg: "bg-gray-100 text-gray-700" };
    }
}

export const GeneralTab = ({ task, onRefresh, isReviewMode = false }: GeneralTabProps) => {
  const { toast } = useToast();
  
  // State xử lý loading chung
  const [isProcessing, setIsProcessing] = useState(false);

  // State cho Dialog Từ chối
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const priorityInfo = getPriorityDisplay(task.priority);
  const statusInfo = getStatusBadge(task.status);
  
  // Logic hiển thị Assignee
  const mainAssignment = task.assignments?.find(a => a.assignmentType === "MAIN");
  const assigneeName = mainAssignment?.user?.fullName 
    || mainAssignment?.unit?.unitName 
    || "Chưa phân công";
  const isUnitAssigned = !mainAssignment?.user && !!mainAssignment?.unit;

  // --- 1. LOGIC NHÂN VIÊN: GỬI DUYỆT ---
  const handleSubmit = async () => {
    try {
        setIsProcessing(true);
        await taskApi.submit(task.id);
        toast({ title: "Thành công", description: "Đã gửi yêu cầu duyệt.", className: "bg-green-600 text-white" });
        onRefresh(); 
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể gửi báo cáo." });
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 2. LOGIC QUẢN LÝ: DUYỆT BÀI ---
  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      // Gọi API approve (status -> COMPLETED)
      await taskApi.updateReviewStatus(task.id, "COMPLETED");
      toast({ title: "Đã duyệt", description: "Công việc đã hoàn thành.", className: "bg-green-600 text-white" });
      onRefresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể duyệt bài." });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 3. LOGIC QUẢN LÝ: TỪ CHỐI ---
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return toast({ variant: "destructive", description: "Vui lòng nhập lý do từ chối." });
    
    try {
      setIsProcessing(true);
      // Gọi API reject (status -> REJECTED hoặc IN_PROGRESS tùy BE, ở đây ta gửi REJECTED)
      await taskApi.updateReviewStatus(task.id, "REJECTED");
      // Có thể cần gọi thêm API comment để lưu lý do, nhưng tạm thời API status update chỉ nhận status
      // Nếu API reject có body lý do riêng thì dùng hàm khác, ở đây ta giả định updateReviewStatus xử lý status trước.
      
      toast({ title: "Đã từ chối", description: "Đã yêu cầu chỉnh sửa." });
      setIsRejectOpen(false);
      onRefresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể từ chối." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ================= CỘT TRÁI ================= */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. TÊN CÔNG VIỆC */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Tên công việc <span className="text-red-500">*</span>
            </label>
            <div className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 font-medium shadow-sm">
              {task.taskName}
            </div>
          </div>

          {/* 2. MÔ TẢ */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Mô tả chi tiết
            </label>
            <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
              <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
                <div className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><Bold className="w-4 h-4" /></div>
                <div className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><Italic className="w-4 h-4" /></div>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <div className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><List className="w-4 h-4" /></div>
              </div>
              <div className="p-4 min-h-[160px] text-sm text-gray-700 leading-relaxed">
                 {task.description ? (
                   <div className="whitespace-pre-wrap">{task.description}</div>
                 ) : (
                   <span className="text-gray-400 italic">Chưa có mô tả...</span>
                 )}
              </div>
            </div>
          </div>

          {/* 3. ĐÍNH KÈM */}
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Đính kèm
            </label>
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

            {/* [QUAN TRỌNG] Ẩn vùng Upload nếu là Reviewer */}
            {!isReviewMode && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                    <CloudUpload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                        <span className="text-blue-600 font-semibold">Chọn file</span> hoặc kéo thả vào đây
                    </p>
                </div>
            )}
          </div>

          {/* 4. TRAO ĐỔI */}
          <div className="pt-4">
             <div className="flex items-center gap-2 mb-4">
                 <h3 className="text-xs font-bold text-gray-500 uppercase">Trao đổi / Bình luận</h3>
             </div>
             <div className="border rounded-lg bg-white p-4 shadow-sm">
                <DiscussionThread taskId={task.id} />
             </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI ================= */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* 1. TRẠNG THÁI & ACTIONS */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Trạng thái hiện tại
                </label>
                <div className={cn("inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border", statusInfo.bg)}>
                    {statusInfo.label}
                </div>
            </div>

            {/* --- ACTION A: NHÂN VIÊN (GỬI DUYỆT) --- */}
            {!isReviewMode && task.status === "IN_PROGRESS" && (
                <div className="pt-2 border-t mt-3">
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isProcessing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all active:scale-95"
                    >
                        {isProcessing ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý...</>
                        ) : (
                            <><Send className="w-4 h-4 mr-2" /> Gửi duyệt</>
                        )}
                    </Button>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Công việc sẽ chuyển sang trạng thái <strong>Chờ duyệt</strong>.
                    </p>
                </div>
            )}
            
            {/* --- ACTION B: QUẢN LÝ (DUYỆT / TỪ CHỐI) --- */}
            {isReviewMode && task.status === "PENDING_REVIEW" && (
                 <div className="pt-2 border-t mt-3 space-y-2">
                    <Button 
                        onClick={handleApprove} 
                        disabled={isProcessing}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-sm"
                    >
                        {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <CheckCircle className="mr-2 w-4 h-4"/>}
                        Duyệt bài
                    </Button>
                    
                    <Button 
                        onClick={() => setIsRejectOpen(true)} 
                        disabled={isProcessing}
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                        <XCircle className="mr-2 w-4 h-4"/> Yêu cầu sửa lại
                    </Button>
                 </div>
            )}

            {isReviewMode && task.status === "COMPLETED" && (
                 <div className="pt-2 border-t mt-3 text-center text-green-600 text-sm font-medium">
                    <CheckCircle className="inline-block w-4 h-4 mr-1"/> Đã duyệt xong
                 </div>
            )}
            
             {task.status === "OPEN" && (
                <div className="pt-2 border-t mt-3 text-center">
                    <p className="text-xs text-gray-400 italic">
                        Công việc chưa bắt đầu. Hãy cập nhật tiến độ để thực hiện.
                    </p>
                </div>
            )}
          </div>

          {/* 2. NGƯỜI THỰC HIỆN */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Người thực hiện
            </label>
            <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center gap-2 shadow-sm">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0", 
                    isUnitAssigned ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                )}>
                    {mainAssignment?.user?.avatarUrl ? (
                      <img src={mainAssignment.user.avatarUrl} alt="avt" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      isUnitAssigned ? <UsersIcon className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />
                    )}
                </div>
                <span className="text-sm text-gray-700 font-medium truncate flex-1" title={assigneeName}>
                    {assigneeName}
                </span>
            </div>
          </div>

          {/* 3. ĐỘ ƯU TIÊN */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Độ ưu tiên
            </label>
            <div className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md flex items-center gap-2 shadow-sm">
                <div className={cn("w-2.5 h-2.5 rounded-full", priorityInfo.color)} />
                <span className="text-sm text-gray-700 font-medium">
                    {priorityInfo.label}
                </span>
            </div>
          </div>

          {/* 4. HẠN CHÓT */}
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

      {/* DIALOG NHẬP LÝ DO TỪ CHỐI */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu chỉnh sửa</DialogTitle>
          </DialogHeader>
          <div className="py-2">
             <p className="text-sm text-gray-500 mb-2">Vui lòng nhập lý do hoặc nội dung cần chỉnh sửa:</p>
             <Textarea 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Thiếu chữ ký trang 3..."
                className="h-32"
             />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Hủy</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleRejectConfirm} disabled={isProcessing}>
               {isProcessing ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};