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
  AlertCircle,
  FileCheck, // Icon mới cho phần nộp bài
  Trash2,
  FileText
} from "lucide-react";
// [UPDATE] Import Schema type
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
import { Download } from "lucide-react";

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
  
  // Dialog Reject
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Dialog Submit Files (Nộp bài)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [submissionComment, setSubmissionComment] = useState("");

  // State xử lý Upload thường
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitFileInputRef = useRef<HTMLInputElement>(null);

  const priorityInfo = getPriorityDisplay(task.priority);
  const statusInfo = getStatusBadge(task.status);
  
  const mainAssignment = task.assignments?.find(a => a.assignmentType === "MAIN");
  const assigneeName = mainAssignment?.user?.fullName || mainAssignment?.unit?.unitName || "Chưa phân công";
  const isUnitAssigned = !mainAssignment?.user && !!mainAssignment?.unit;

  // --- HANDLERS ---

  // 1. Xử lý Upload file Đính kèm (Giữ nguyên logic cũ)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
        setIsUploading(true);
        await taskApi.uploadAttachment(task.id, files);
        toast({ title: "Thành công", description: "Đã tải lên tài liệu đính kèm.", className: "bg-[#009d98] text-white border-none" });
        onRefresh(); 
    } catch (error) {
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải lên tài liệu." });
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 2. [NEW] Xử lý chọn file Nộp bài (Chưa upload ngay, chỉ lưu vào state)
  const handleSubmitFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
        // Cộng dồn file mới vào danh sách cũ
        setSubmissionFiles(prev => [...prev, ...Array.from(e.target.files!)]);
     }
  };

  const removeSubmissionFile = (index: number) => {
     setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 3. [NEW] Handler Nộp kết quả (Gọi API submitFiles)
  const handleSubmitResult = async () => {
     if (submissionFiles.length === 0) {
        toast({ variant: "destructive", description: "Vui lòng chọn ít nhất 1 file kết quả." });
        return;
     }

     try {
        setIsProcessing(true);

        // Gọi API submitFiles trực tiếp với File[] và comment
        // Backend sẽ tự upload lên Drive và lưu vào submission_data
        await taskApi.submitFiles(
            task.id,
            submissionFiles,
            submissionComment || undefined
        );

        toast({ title: "Nộp bài thành công", description: "Đã gửi kết quả và chờ duyệt.", className: "bg-[#009d98] text-white border-none" });
        setIsSubmitDialogOpen(false);
        setSubmissionFiles([]);
        setSubmissionComment("");
        onRefresh();
     } catch (error) {
        toast({ variant: "destructive", title: "Lỗi nộp bài", description: "Có lỗi xảy ra khi gửi dữ liệu." });
     } finally {
        setIsProcessing(false);
     }
  };

  // 4. Submit thường (chuyển trạng thái)
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

          {/* 2. ATTACHMENTS (ĐÍNH KÈM THƯỜNG) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm group">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#009d98]" />
                    Tài liệu tham khảo / Đính kèm
                </h3>
                {/* Nút Upload nhỏ gọn hơn */}
                {!isReviewMode && task.status !== "COMPLETED" && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 gap-2 text-[#009d98] border-[#009d98]/30 hover:bg-[#009d98]/10"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="w-3 h-3 animate-spin"/> : <CloudUpload className="w-3 h-3"/>}
                        Thêm tài liệu
                    </Button>
                )}
             </div>
             
             {/* Hidden Input cho Upload Thường */}
             <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading}
             />
             
             {/* List Files */}
             {task.attachmentUrl && task.attachmentUrl.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {task.attachmentUrl.map((url, idx) => (
                        <a 
                            key={idx} 
                            href={url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-[#009d98]/50 hover:bg-[#009d98]/5 transition-all bg-slate-50/30 relative z-10 cursor-pointer"
                        >
                            <div className="p-2 bg-white rounded-md border border-slate-100 shadow-sm mr-3 text-[#009d98]">
                                <Paperclip className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-slate-600 font-medium truncate flex-1">
                                {url.split('/').pop() || `File ${idx + 1}`}
                            </span>
                        </a>
                    ))}
                </div>
             ) : (
                <div className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded border border-dashed text-center">
                    Chưa có tài liệu đính kèm.
                </div>
             )}
          </div>

          {/* 3. SUBMISSION FILES (FILE ĐÃ NỘP) */}
          {task.submissionData && task.submissionData.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                     Kết quả đã nộp
                  </h3>
                  <Badge variant="outline" className="ml-auto bg-emerald-50 text-emerald-700 border-emerald-200">
                     {task.submissionData.length} file
                  </Badge>
               </div>

               <div className="space-y-3">
                  {task.submissionData.map((item) => (
                     <div key={item.fileId} className="border border-slate-200 rounded-lg p-4 bg-slate-50/30 hover:bg-emerald-50/30 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                           <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="p-2 bg-white rounded-md border border-emerald-100 shadow-sm text-emerald-600 shrink-0">
                                 <FileText className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-semibold text-slate-800 truncate" title={item.name}>
                                    {item.name}
                                 </p>
                                 <p className="text-xs text-slate-500">
                                    Nộp bởi <span className="font-medium text-slate-700">{item.uploadedName}</span>
                                 </p>
                              </div>
                           </div>
                           <a
                              href={item.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 p-2 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                              title="Tải xuống"
                           >
                              <Download className="w-4 h-4" />
                           </a>
                        </div>

                        {item.comment && (
                           <div className="mt-2 pt-2 border-t border-slate-200">
                              <p className="text-xs text-slate-500 italic">
                                 <span className="font-semibold text-slate-600">Ghi chú:</span> {item.comment}
                              </p>
                           </div>
                        )}

                        <div className="mt-2 text-xs text-slate-400">
                           {new Date(item.uploadedAt).toLocaleString('vi-VN')}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* 4. DISCUSSION */}
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

             {/* === [NEW] KHU VỰC NỘP KẾT QUẢ === */}
             {!isReviewMode && task.status !== "COMPLETED" && (
                <div className="mt-4 pt-4 border-t border-slate-100 relative z-20">
                    <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100 mb-3">
                        <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2 flex items-center gap-2">
                             <FileCheck className="w-4 h-4" /> Báo cáo kết quả
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-tight mb-3">
                            Nộp các file sản phẩm cuối cùng tại đây để gửi duyệt.
                        </p>

                        {/* Nút mở Dialog Nộp bài */}
                        <Button
                            onClick={() => setIsSubmitDialogOpen(true)}
                            disabled={isProcessing}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 shadow-sm gap-2 relative z-20"
                        >
                            <CloudUpload className="w-4 h-4"/>
                            Nộp kết quả
                        </Button>
                    </div>

                    {/* Nút gửi duyệt (chỉ chuyển trạng thái nếu đã nộp file trước đó) */}
                    <Button 
                        onClick={handleSubmit} 
                        variant="ghost"
                        disabled={isProcessing}
                        className="w-full text-slate-500 hover:text-[#009d98] hover:bg-[#009d98]/10 h-9 gap-2 text-xs"
                    >
                        {isProcessing ? <Loader2 className="animate-spin w-3 h-3"/> : <Send className="w-3 h-3"/>}
                        Chỉ gửi yêu cầu duyệt (Không nộp thêm file)
                    </Button>
                </div>
             )}

             {/* ACTIONS CHO REVIEWER */}
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

      {/* --- DIALOG 1: TỪ CHỐI --- */}
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

      {/* --- DIALOG 2: NỘP KẾT QUẢ --- */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#009d98] mb-1">
                <FileCheck className="w-5 h-5" />
                <DialogTitle>Nộp kết quả công việc</DialogTitle>
            </div>
            <DialogDescription>
                Tải lên các tài liệu sản phẩm và gửi lời nhắn cho người duyệt.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
             {/* 1. Chọn file */}
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Tài liệu đính kèm</label>
                
                {/* Khu vực Drag/Click Upload */}
                <div 
                    onClick={() => submitFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-[#009d98]/50 cursor-pointer transition-colors"
                >
                     <CloudUpload className="w-8 h-8 text-slate-300 mb-2" />
                     <p className="text-sm font-medium text-slate-600">Nhấn để chọn file</p>
                     <p className="text-xs text-slate-400">(Hỗ trợ nhiều file)</p>
                     <input 
                        type="file" 
                        ref={submitFileInputRef} 
                        className="hidden" 
                        multiple 
                        onChange={handleSubmitFileSelect}
                     />
                </div>

                {/* Danh sách file đã chọn */}
                {submissionFiles.length > 0 && (
                    <div className="space-y-2 mt-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                        {submissionFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-4 h-4 text-[#009d98] shrink-0" />
                                    <span className="truncate max-w-[250px] text-slate-700">{file.name}</span>
                                    <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <button 
                                    onClick={() => removeSubmissionFile(idx)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
             </div>

             {/* 2. Lời nhắn */}
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Lời nhắn / Ghi chú</label>
                <Textarea 
                    value={submissionComment}
                    onChange={(e) => setSubmissionComment(e.target.value)}
                    placeholder="Nhập nội dung ghi chú cho người duyệt..."
                    className="resize-none"
                    rows={3}
                />
             </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSubmitDialogOpen(false)}>Hủy bỏ</Button>
            <Button 
                className="bg-[#009d98] hover:bg-[#008580] text-white font-bold gap-2" 
                onClick={handleSubmitResult} 
                disabled={isProcessing || submissionFiles.length === 0}
            >
                {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                Gửi bài & Hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};