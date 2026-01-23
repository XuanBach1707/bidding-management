"use client";

import React from 'react';
import { useQuery } from "@tanstack/react-query";
import {
  X as XIcon, Lock, Calendar, Tag, Info, AlertCircle, Loader2,
  Briefcase, User as UserIcon, Shield, Building2, MessageSquare, Clock,
  // [NEW] Icons cho History
  History, ArrowRight, Activity, CheckCircle2, FileEdit, Sparkles
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { taskApi, TASK_TAG_LABEL, TASK_TYPE_LABEL } from "@/entities/task";
import { commentApi } from "@/entities/comment"; 
// [NEW] Import API History
import { getTaskHistory } from "@/entities/task-timeline";

interface TaskDetailPanelProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

// --- TAB 1: COMMENTS (GIỮ NGUYÊN) ---
const TaskCommentsTab = ({ taskId }: { taskId: number }) => {
  const { data: comments = [], isLoading, isError } = useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: () => commentApi.getComments(taskId),
    staleTime: 0, 
  });

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009d98]" /></div>;
  if (isError) return <div className="p-6 text-center text-red-500 text-xs">Không thể tải nội dung.</div>;

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
           <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-500">Chưa có nội dung trao đổi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-1">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3 md:gap-4 items-start group animate-in fade-in slide-in-from-bottom-2 duration-300">
           <Avatar className="w-8 h-8 md:w-9 md:h-9 mt-1 border border-slate-200 shadow-sm shrink-0">
              <AvatarFallback className="bg-[#009d98]/10 text-[#009d98] text-xs font-bold">
                 {comment.author.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
           </Avatar>

           <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                 <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                    {comment.author.fullName}
                 </span>
                 <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium shrink-0">
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    {format(new Date(comment.createdAt), "HH:mm dd/MM", { locale: vi })}
                 </span>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-xl rounded-tl-none border border-slate-100 text-sm text-slate-700 leading-relaxed shadow-sm break-words">
                 {comment.content}
              </div>

              {comment.replies && comment.replies.length > 0 && (
                 <div className="mt-3 ml-2 pl-3 border-l-2 border-slate-100 space-y-3">
                    {comment.replies.map(reply => (
                       <div key={reply.id} className="flex gap-2 items-start">
                          <Avatar className="w-5 h-5 mt-1 shrink-0">
                             <AvatarFallback className="bg-slate-100 text-slate-500 text-[9px] font-bold">
                                {reply.author.fullName.charAt(0)}
                             </AvatarFallback>
                          </Avatar>
                          <div className="bg-white p-2 rounded-lg border border-slate-100 text-xs text-slate-600 shadow-sm w-full break-words">
                             <span className="font-bold text-slate-800 mr-1 block mb-0.5">{reply.author.fullName}</span>
                             {reply.content}
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      ))}
      <div className="pt-8 pb-4 text-center">
         <span className="text-[10px] text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            Chế độ xem: Không thể phản hồi tại đây.
         </span>
      </div>
    </div>
  );
};

// --- [NEW] TAB 2: HISTORY TIMELINE ---
const TaskHistoryTab = ({ taskId }: { taskId: number }) => {
  const { data: history = [], isLoading, isError } = useQuery({
    queryKey: ["task-history", taskId],
    queryFn: () => getTaskHistory(taskId),
    staleTime: 0,
  });

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#009d98]" /></div>;
  if (isError) return <div className="p-6 text-center text-red-500 text-xs">Không thể tải lịch sử.</div>;

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
           <History className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-500">Chưa có lịch sử hoạt động.</p>
      </div>
    );
  }

  // Helper chọn màu/icon cho log
  const getActionStyle = (action: string) => {
      switch(action) {
          case 'CREATED': return { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' };
          case 'APPROVED': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' };
          case 'REJECTED': return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' };
          case 'SUBMITTED': return { icon: FileEdit, color: 'text-amber-500', bg: 'bg-amber-50' };
          default: return { icon: Info, color: 'text-slate-400', bg: 'bg-slate-50' };
      }
  };

  // Đảo ngược thứ tự: Event mới nhất (bao gồm future) ở trên cùng
  const sortedHistory = [...history].reverse();

  return (
    <div className="space-y-6 p-2 relative ml-2 pb-10">
        {/* Line dọc */}
        <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-100 -z-10"></div>

        {sortedHistory.map((log) => {
            const style = getActionStyle(log.action);
            const Icon = style.icon;
            const isFuture = log.isFuture;

            return (
                <div key={log.id} className={cn(
                    "flex gap-4 items-start group animate-in fade-in slide-in-from-bottom-2 duration-300",
                    isFuture && "opacity-70"
                )}>
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm z-10",
                        isFuture ? "bg-blue-50 border-blue-200" : cn(style.bg, "border-white")
                    )}>
                        {isFuture ? (
                            <Sparkles className="w-4 h-4 text-blue-500" />
                        ) : (
                            <Icon className={cn("w-4 h-4", style.color)} />
                        )}
                    </div>

                    <div className={cn(
                        "flex-1 min-w-0 p-3 rounded-xl border shadow-sm hover:shadow-md transition-shadow",
                        isFuture ? "bg-blue-50/30 border-blue-200" : "bg-white border-slate-100"
                    )}>
                        <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Avatar className="w-5 h-5 border border-slate-100">
                                    <AvatarFallback className="text-[9px] bg-slate-100 text-slate-600">
                                        {log.actor.fullName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                                    {log.actor.fullName}
                                </span>
                                {isFuture && (
                                    <Badge className="bg-blue-500 text-white text-[9px] h-4 px-1.5 font-bold">
                                        Dự đoán
                                    </Badge>
                                )}
                            </div>
                            {log.createdAt && (
                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                    {format(new Date(log.createdAt), "HH:mm dd/MM", { locale: vi })}
                                </span>
                            )}
                        </div>

                        <p className={cn(
                            "text-xs leading-relaxed mb-2",
                            isFuture ? "text-slate-500 italic" : "text-slate-600"
                        )}>
                            {log.detail}
                        </p>

                        {log.oldStatus && log.newStatus && log.oldStatus !== log.newStatus && (
                            <div className={cn(
                                "flex items-center gap-2 p-2 rounded-lg border mt-2",
                                isFuture ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100"
                            )}>
                                <Badge variant="outline" className="text-[9px] bg-white text-slate-500 border-slate-200 h-5 px-1.5">
                                    {log.oldStatus}
                                </Badge>
                                <ArrowRight className="w-3 h-3 text-slate-300" />
                                <Badge variant="outline" className={cn(
                                    "text-[9px] bg-white h-5 px-1.5 font-bold shadow-sm",
                                    isFuture ? "text-blue-600 border-blue-300" : "text-slate-800 border-slate-300"
                                )}>
                                    {log.newStatus}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            );
        })}

        <div className="pt-2 text-center">
            <span className="text-[10px] text-slate-300 italic">Bắt đầu công việc</span>
        </div>
    </div>
  );
};

// --- MAIN PANEL ---
export const TaskDetailPanel = ({ taskId, isOpen, onClose }: TaskDetailPanelProps) => {
  const getStatusColor = (status: string) => {
      switch (status) {
        case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "PENDING_REVIEW": return "bg-[#009d98]/10 text-[#009d98] border-[#009d98]/20";
        case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200";
        case "ASSIGNED": return "bg-indigo-50 text-indigo-700 border-indigo-200";
        case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
        default: return "bg-slate-100 text-slate-600 border-slate-200";
      }
  };

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ["task-detail", taskId],
    queryFn: () => taskApi.getDetail(taskId!),
    enabled: !!taskId && isOpen,
    staleTime: 0, 
  });

  return (
    <div className={cn(
        "absolute top-0 right-0 bottom-0 w-full md:w-[500px] bg-white md:border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col font-sans", 
        isOpen ? "translate-x-0" : "translate-x-full"
    )}>
        {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#009d98]" />
                <span className="text-xs font-bold text-slate-500">Đang tải thông tin...</span>
            </div>
        )}

        {isError && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-red-500">
                <AlertCircle className="w-12 h-12 mb-3 opacity-20 text-red-600" />
                <p className="text-sm font-medium">Không thể tải thông tin.</p>
                <button onClick={onClose} className="mt-4 text-xs font-bold underline hover:text-red-700">Đóng</button>
            </div>
        )}

        {!isLoading && task && (
            <>
                {/* 1. HEADER */}
                <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0">
                    <div className="flex justify-between items-start mb-2 md:mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("px-2.5 py-0.5 text-[10px] font-bold uppercase border shadow-none", getStatusColor(task.status))}>
                                {task.status}
                            </Badge>
                            {task.priority === 'HIGH' && (
                                <Badge className="px-2.5 py-0.5 bg-red-50 text-red-600 border-red-200 shadow-none text-[10px] flex items-center gap-1 font-bold">
                                    <AlertCircle className="w-3 h-3" /> Gấp
                                </Badge>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <h2 className="text-lg md:text-xl font-extrabold text-slate-900 leading-tight mb-2 line-clamp-3">{task.taskName}</h2>
                    
                    {task.projectName && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#009d98] mt-1 bg-[#009d98]/5 py-1.5 px-2.5 rounded-md w-fit max-w-full border border-[#009d98]/10">
                            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{task.projectName}</span>
                        </div>
                    )}
                </div>

                {/* 2. TABS CONTENT */}
                <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
                    <div className="px-4 md:px-6 border-b border-slate-100 bg-white shrink-0">
                        <TabsList className="w-full justify-start h-10 md:h-12 bg-transparent p-0 gap-6 md:gap-8 overflow-x-auto no-scrollbar">
                            <TabsTrigger 
                                value="info" 
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#009d98] data-[state=active]:text-[#009d98] px-0 font-bold text-xs uppercase text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                            >
                                Thông tin chung
                            </TabsTrigger>
                            <TabsTrigger 
                                value="comments" 
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#009d98] data-[state=active]:text-[#009d98] px-0 font-bold text-xs uppercase text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
                            >
                                Trao đổi 
                            </TabsTrigger>
                            {/* [NEW] Tab History Trigger */}
                            <TabsTrigger 
                                value="history" 
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#009d98] data-[state=active]:text-[#009d98] px-0 font-bold text-xs uppercase text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
                            >
                                <History className="w-3.5 h-3.5 mb-0.5" /> Luồng Xử Lý
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-6 custom-scrollbar">
                        
                        <TabsContent value="info" className="mt-0 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            
                            {/* Card: Người thực hiện */}
                            <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Phân công thực hiện</h3>
                                <div className="flex items-center gap-3 md:gap-4">
                                    <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-slate-100 shadow-sm shrink-0">
                                        <AvatarFallback className="bg-[#009d98]/10 text-[#009d98] font-bold text-xs md:text-sm">
                                            {task.assignments?.[0]?.user?.fullName?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">
                                            {task.assignments?.[0]?.user?.fullName || "Chưa giao nhân sự"}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{task.assignments?.[0]?.unit?.unitName || "Đơn vị chưa xác định"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                                        <Calendar className="w-3.5 h-3.5 text-red-500" /> Hạn chót
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 pl-0 md:pl-5">
                                        {task.deadline ? format(new Date(task.deadline), "dd/MM/yyyy") : "---"}
                                    </p>
                                </div>
                                <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                                        <Clock className="w-3.5 h-3.5 text-[#009d98]" /> Ngày tạo
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 pl-0 md:pl-5">
                                        {task.createdAt ? format(new Date(task.createdAt), "dd/MM/yyyy") : "---"}
                                    </p>
                                </div>
                                <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm col-span-2">
                                    <div className="flex items-center gap-2 mb-3 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                                        <Tag className="w-3.5 h-3.5 text-indigo-500" /> Phân loại
                                    </div>
                                    <div className="md:pl-5 flex gap-2 flex-wrap">
                                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-2.5 py-1">
                                            {task.tag && (TASK_TAG_LABEL as any)[task.tag] ? (TASK_TAG_LABEL as any)[task.tag] : "Khác"}
                                        </Badge>
                                        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 font-bold px-2.5 py-1">
                                            {task.taskType && (TASK_TYPE_LABEL as any)[task.taskType] ? (TASK_TYPE_LABEL as any)[task.taskType] : task.taskType}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5" /> Mô tả chi tiết
                                </h3>
                                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line min-h-[60px] break-words">
                                    {task.description || <span className="text-slate-400 italic text-xs">Không có mô tả.</span>}
                                </div>
                            </div>

                            {/* Footer Security */}
                            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-4 pb-2 border-t border-slate-200 border-dashed">
                                <Shield className="w-3 h-3" />
                                <span>Bảo mật cấp: <b className="text-slate-600">{task.assignments?.[0]?.requiredMinSecurity || 1}</b></span>
                            </div>
                        </TabsContent>

                        <TabsContent value="comments" className="mt-0">
                            <TaskCommentsTab taskId={task.id} />
                        </TabsContent>

                        {/* [NEW] Tab History Content */}
                        <TabsContent value="history" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <TaskHistoryTab taskId={task.id} />
                        </TabsContent>

                    </div>
                </Tabs>
            </>
        )}
    </div>
  );
};