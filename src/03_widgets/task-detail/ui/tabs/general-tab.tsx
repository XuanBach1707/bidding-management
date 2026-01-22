"use client";

import { useState, useRef } from "react";
import { 
  Calendar, 
  User as UserIcon, 
  Users as UsersIcon,
  CloudUpload, 
  Paperclip,
  Send,      
  Loader2,
  CheckCircle, 
  XCircle,
  AlertCircle
} from "lucide-react";
import { Task, TaskPriority, taskApi } from "@/entities/task";
import { DiscussionThread } from "@/features/comment/discussion-thread";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button"; 
import { useToast } from "@/shared/lib/hooks/use-toast"; 
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/ui/dialog";

interface GeneralTabProps {
  task: Task;
  onRefresh: () => void;
  isReviewMode?: boolean; 
}

/**
 * Helper: Lấy chữ cái đầu của Tên
 */
const getInitials = (name: string) => {
  if (!name || name === "Chưa phân công") return "U";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
};

const getPriorityDisplay = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH: return { label: "Cao", color: "bg-red-50 text-red-700 border-red-200" };
    case TaskPriority.MEDIUM: return { label: "Trung bình", color: "bg-blue-50 text-blue-700 border-blue-200" };
    case TaskPriority.LOW: return { label: "Thấp", color: "bg-slate-50 text-slate-700 border-slate-200" };
    default: return { label: "N/A", color: "bg-gray-100 text-gray-500" };
  }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case "OPEN": return { label: "Mới tạo", bg: "bg-slate-100 text-slate-600 border-slate-200" };
        case "IN_PROGRESS": return { label: "Đang thực hiện", bg: "bg-blue-50 text-blue-700 border-blue-200" };
        case "PENDING_REVIEW": return { label: "Chờ duyệt", bg: "bg-amber-50 text-amber-700 border-amber-200" };
        case "COMPLETED": return { label: "Hoàn thành", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
        case "REJECTED": return { label: "Đã từ chối", bg: "bg-red-50 text-red-700 border-red-200" };
        default: return { label: status, bg: "bg-gray-100" };
    }
}

export const GeneralTab = ({ task, onRefresh, isReviewMode = false }: GeneralTabProps) => {
  const { toast } = useToast();
  
  // State xử lý Submit/Approve/Reject
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // State xử lý Upload
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const priorityInfo = getPriorityDisplay(task.priority);
  const statusInfo = getStatusBadge(task.status);
  
  const mainAssignment = task.assignments?.find(a => a.assignmentType === "MAIN");
  const assigneeName = mainAssignment?.user?.fullName || mainAssignment?.unit?.unitName || "Chưa phân công";
  const isUnitAssigned = !mainAssignment?.user && !!mainAssignment?.unit;

  // --- HANDLERS ---

  // Xử lý chọn file (Upload)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
        setIsUploading(true);
        // Gọi API Upload
        await taskApi.uploadAttachment(task.id, files);
        
        toast({ title: "Thành công", description: "Đã tải lên tài liệu.", className: "bg-[#009d98] text-white border-none" });
        
        // Refresh lại data để hiện file mới ngay lập tức
        onRefresh(); 
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải lên tài liệu." });
    } finally {
        setIsUploading(false);
        // Reset input để cho phép chọn lại cùng 1 file nếu muốn
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  const handleSubmit = async () => {
    try {
        setIsProcessing(true);
        await taskApi.submit(task.id);
        toast({ title: "Thành công", description: "Đã gửi yêu cầu duyệt.", className: "bg-[#009d98] text-white border-none" });
        onRefresh(); 
    } catch (error) {
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể gửi báo cáo." });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await taskApi.updateReviewStatus(task.id, "COMPLETED");
      toast({ title: "Đã duyệt", description: "Công việc đã hoàn thành.", className: "bg-[#009d98] text-white border-none" });
      onRefresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể duyệt bài." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return toast({ variant: "destructive", description: "Vui lòng nhập lý do từ chối." });
    
    try {
      setIsProcessing(true);
      await taskApi.updateReviewStatus(task.id, "REJECTED");
      
      toast({ title: "Đã từ chối", description: "Yêu cầu đã được trả lại." });
      setIsRejectOpen(false);
      onRefresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể từ chối." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= CỘT TRÁI (MAIN INFO) - 8 COL ================= */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. HEADER CARD */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 leading-snug mb-2">
                        {task.taskName}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <Badge className={cn("lg:hidden border", statusInfo.bg)} variant="outline">
                            {statusInfo.label}
                        </Badge>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Mô tả công việc</label>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                        {task.description || <span className="italic text-slate-400">Không có mô tả chi tiết.</span>}
                    </div>
                </div>
             </div>
          </div>

          {/* 2. ATTACHMENTS */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#009d98]" />
                Tài liệu đính kèm
             </h3>
             
             {/* Danh sách file đã upload */}
             {task.attachmentUrl && task.attachmentUrl.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {task.attachmentUrl.map((url, idx) => (
                        <a 
                            key={idx} 
                            href={url} 
                            target="_blank" 
                            rel="noreferrer" 
                            // [FIX] Thêm relative z-10 để đảm bảo click được
                            className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-[#009d98]/50 hover:bg-[#009d98]/5 transition-all group bg-slate-50/30 relative z-10 cursor-pointer"
                        >
                            <div className="p-2 bg-white rounded-md border border-slate-100 shadow-sm mr-3 group-hover:border-[#009d98]/20">
                                <CloudUpload className="w-4 h-4 text-[#009d98]" />
                            </div>
                            <span className="text-sm text-slate-600 font-medium truncate flex-1 group-hover:text-[#009d98] transition-colors">
                                {url.split('/').pop() || `File ${idx + 1}`}
                            </span>
                        </a>
                    ))}
                </div>
             ) : (
                <div className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded border border-dashed text-center">
                    Chưa có file đính kèm.
                </div>
             )}

             {/* Khu vực Upload */}
             {!isReviewMode && task.status !== "COMPLETED" && (
                <label
                    className={cn(
                        "mt-4 border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 transition-all relative z-10",
                        isUploading ? "cursor-wait opacity-70 pointer-events-none" : "cursor-pointer hover:bg-slate-100 hover:border-slate-300 active:scale-[0.98]"
                    )}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileSelect}
                        disabled={isUploading}
                    />

                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-[#009d98] mb-2 animate-spin" />
                            <p className="text-sm text-[#009d98] font-medium animate-pulse">Đang tải lên...</p>
                        </>
                    ) : (
                        <>
                            <CloudUpload className="w-8 h-8 text-slate-300 mb-2" />
                            <p className="text-sm text-slate-500 font-medium">Click để tải lên tài liệu</p>
                            <p className="text-xs text-slate-400">Hỗ trợ PDF, Excel, Word (Max 20MB)</p>
                        </>
                    )}
                </label>
             )}
          </div>

          {/* 3. DISCUSSION */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <DiscussionThread taskId={task.id} />
          </div>
        </div>

        {/* ================= CỘT PHẢI (META & ACTIONS) - 4 COL ================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* A. STATUS CARD */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</span>
                <Badge variant="outline" className={cn("font-bold px-2.5 py-1", statusInfo.bg)}>
                    {statusInfo.label}
                </Badge>
             </div>

             {!isReviewMode && task.status === "IN_PROGRESS" && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isProcessing}
                        className="w-full bg-[#009d98] hover:bg-[#008580] text-white font-bold h-11 shadow-md gap-2"
                    >
                        {isProcessing ? <Loader2 className="animate-spin w-4 h-4"/> : <Send className="w-4 h-4"/>}
                        Gửi duyệt
                    </Button>
                    <p className="text-xs text-center text-slate-400 mt-2">
                        Xác nhận hoàn thành công việc để quản lý kiểm tra.
                    </p>
                </div>
             )}

             {isReviewMode && task.status === "PENDING_REVIEW" && (
                 <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <Button 
                        onClick={handleApprove} 
                        disabled={isProcessing}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 shadow-sm gap-2"
                    >
                        {isProcessing ? <Loader2 className="animate-spin w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                        Duyệt hoàn thành
                    </Button>
                    <Button 
                        onClick={() => setIsRejectOpen(true)} 
                        disabled={isProcessing}
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-11 gap-2"
                    >
                        <XCircle className="w-4 h-4"/> Yêu cầu sửa lại
                    </Button>
                 </div>
             )}
          </div>

          {/* B. INFO CARD */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
             {/* Người thực hiện */}
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Người thực hiện</label>
                <div className="flex items-center gap-3">
                    <Avatar className={cn(
                        "w-10 h-10 border shadow-sm",
                        isUnitAssigned ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-blue-50 border-blue-200 text-blue-600"
                    )}>
                        {mainAssignment?.user?.avatarUrl && (
                             <AvatarImage src={mainAssignment.user.avatarUrl} alt="avt" className="object-cover" />
                        )}
                        <AvatarFallback className="text-xs font-extrabold bg-transparent">
                            {isUnitAssigned ? (
                                <UsersIcon className="w-4 h-4" />
                            ) : (
                                getInitials(assigneeName)
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 line-clamp-1" title={assigneeName}>{assigneeName}</span>
                        <span className="text-xs text-slate-500">{isUnitAssigned ? "Đơn vị" : "Cá nhân"}</span>
                    </div>
                </div>
             </div>

             {/* Priority */}
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Độ ưu tiên</label>
                <Badge variant="outline" className={cn("font-medium border", priorityInfo.color)}>
                    {priorityInfo.label}
                </Badge>
             </div>

             {/* Deadline */}
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Hạn hoàn thành</label>
                <div className="flex items-center gap-2 text-sm font-mono font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded border border-slate-100">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {task.deadline ? new Date(task.deadline).toLocaleDateString("vi-VN") : "--/--/----"}
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* DIALOG TỪ CHỐI */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertCircle className="w-5 h-5" />
                <DialogTitle>Yêu cầu chỉnh sửa</DialogTitle>
            </div>
            <DialogDescription>
                Vui lòng nhập lý do từ chối để nhân viên biết cần chỉnh sửa nội dung gì.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
             <Textarea 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Thiếu chữ ký trang 3, số liệu chưa khớp..."
                className="h-32 resize-none focus:border-red-400 focus:ring-red-200"
             />
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)}>Hủy bỏ</Button>
            <Button 
                className="bg-red-600 hover:bg-red-700 text-white font-bold" 
                onClick={handleRejectConfirm} 
                disabled={isProcessing}
            >
                {isProcessing ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};