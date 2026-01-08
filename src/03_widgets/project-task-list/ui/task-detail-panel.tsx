"use client";

import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { 
    X as XIcon, Lock, Calendar, Tag, Info, AlertCircle, Loader2, 
    Briefcase, User as UserIcon, Shield, Building2, MessageSquare, Clock
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar"; // Bỏ AvatarImage vì API không trả về URL
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// IMPORTS ENTITIES
import { taskApi, TASK_TAG_LABEL, TASK_TYPE_LABEL } from "@/entities/task";
import { commentApi } from "@/entities/comment"; // [MỚI] Import từ entity comment

interface TaskDetailPanelProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

// --- SUB COMPONENT: COMMENT LIST ---
const TaskCommentsTab = ({ taskId }: { taskId: number }) => {
    // Gọi API từ commentApi
    const { data: comments = [], isLoading, isError } = useQuery({
        queryKey: ["task-comments", taskId],
        queryFn: () => commentApi.getComments(taskId),
        staleTime: 0, 
    });

    if (isLoading) return <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>;
    
    if (isError) return <div className="p-6 text-center text-red-500 text-xs">Không thể tải nội dung trao đổi.</div>;

    if (comments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">Chưa có nội dung trao đổi nào.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5 p-1">
            {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 items-start group animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Avatar: Dùng Initials vì API không có URL */}
                    <Avatar className="w-8 h-8 mt-1 border border-slate-100 shadow-sm">
                        <AvatarFallback className="bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                            {comment.author.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Content Bubble */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-700">
                                {comment.author.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                {format(new Date(comment.createdAt), "HH:mm dd/MM", { locale: vi })}
                            </span>
                        </div>
                        
                        <div className="bg-white border border-slate-200 rounded-lg rounded-tl-none p-3 text-sm text-slate-700 leading-relaxed shadow-sm">
                            {comment.content}
                        </div>

                        {/* Hiển thị replies nếu có (Đệ quy đơn giản 1 cấp) */}
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 ml-2 pl-3 border-l-2 border-slate-100 space-y-3">
                                {comment.replies.map(reply => (
                                    <div key={reply.id} className="flex gap-3 items-start">
                                        <Avatar className="w-6 h-6 mt-1">
                                            <AvatarFallback className="bg-slate-100 text-slate-500 text-[9px]">
                                                {reply.author.fullName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="bg-slate-50 p-2 rounded-lg text-xs text-slate-600">
                                            <span className="font-bold text-slate-700 mr-1">{reply.author.fullName}:</span>
                                            {reply.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            {/* Read-only Footer */}
            <div className="pt-8 pb-4 text-center">
                <span className="text-[10px] text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    Chế độ xem: Không thể phản hồi tại đây.
                </span>
            </div>
        </div>
    );
};

// --- MAIN PANEL (Logic giữ nguyên, chỉ chỉnh sửa UI cho đẹp) ---
export const TaskDetailPanel = ({ taskId, isOpen, onClose }: TaskDetailPanelProps) => {
  
  const getStatusColor = (status: string) => {
      switch (status) {
        case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
        case "PENDING_REVIEW": return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
        case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
        case "ASSIGNED": return "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100";
        case "REJECTED": return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
        default: return "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100";
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
        "absolute top-0 right-0 bottom-0 w-[500px] bg-white border-l shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col font-sans", 
        isOpen ? "translate-x-0" : "translate-x-full"
    )}>
        {/* Loading */}
        {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Đang tải thông tin...</span>
            </div>
        )}

        {/* Error */}
        {isError && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-red-500">
                <AlertCircle className="w-10 h-10 mb-3 opacity-80" />
                <p className="text-sm">Không thể tải thông tin.</p>
                <button onClick={onClose} className="mt-4 text-xs underline hover:text-red-700">Đóng</button>
            </div>
        )}

        {/* Content */}
        {!isLoading && task && (
            <>
                {/* 1. HEADER (Fixed) */}
                <div className="px-6 py-5 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm/50">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <Badge className={cn("px-2.5 py-0.5 text-[11px] font-bold uppercase border shadow-none", getStatusColor(task.status))}>
                                {task.status}
                            </Badge>
                            {task.priority === 'HIGH' && (
                                <Badge className="px-2.5 py-0.5 bg-red-50 text-red-600 border-red-200 shadow-none text-[11px] flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Gấp
                                </Badge>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight mb-1">{task.taskName}</h2>
                    
                    {task.projectName && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 bg-slate-50 py-1 px-2 rounded w-fit max-w-full">
                            <Briefcase className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{task.projectName}</span>
                        </div>
                    )}
                </div>

                {/* 2. TABS CONTENT */}
                <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 border-b bg-white">
                        <TabsList className="w-full justify-start h-11 bg-transparent p-0 gap-6">
                            <TabsTrigger value="info" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-0 font-bold text-xs uppercase">
                                Thông tin chung
                            </TabsTrigger>
                            <TabsTrigger value="comments" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-0 font-bold text-xs uppercase flex items-center gap-1.5">
                                Trao đổi 
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
                        
                        {/* TAB: INFO */}
                        <TabsContent value="info" className="mt-0 space-y-5">
                            
                            {/* Card: Người thực hiện */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Phân công thực hiện</h3>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border border-slate-100">
                                        {/* Fallback avatar nếu không có URL */}
                                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-sm">
                                            {task.assignments?.[0]?.user?.fullName?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">
                                            {task.assignments?.[0]?.user?.fullName || "Chưa giao nhân sự"}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                                            <Building2 className="w-3 h-3" />
                                            <span className="truncate">{task.assignments?.[0]?.unit?.unitName || "Đơn vị chưa xác định"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1 text-slate-500 text-[10px] font-bold uppercase">
                                        <Calendar className="w-3.5 h-3.5 text-orange-500" /> Hạn chót
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 pl-5">
                                        {task.deadline ? format(new Date(task.deadline), "dd/MM/yyyy") : "---"}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1 text-slate-500 text-[10px] font-bold uppercase">
                                        <Clock className="w-3.5 h-3.5 text-blue-500" /> Ngày tạo
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 pl-5">
                                        {task.createdAt ? format(new Date(task.createdAt), "dd/MM/yyyy") : "---"}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm col-span-2">
                                    <div className="flex items-center gap-2 mb-2 text-slate-500 text-[10px] font-bold uppercase">
                                        <Tag className="w-3.5 h-3.5 text-purple-500" /> Phân loại
                                    </div>
                                    <div className="pl-5 flex gap-2">
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100 font-medium">
                                            {task.tag && (TASK_TAG_LABEL as any)[task.tag] ? (TASK_TAG_LABEL as any)[task.tag] : "Khác"}
                                        </Badge>
                                        <Badge variant="outline" className="text-slate-600 font-medium">
                                            {task.taskType && (TASK_TYPE_LABEL as any)[task.taskType] ? (TASK_TYPE_LABEL as any)[task.taskType] : task.taskType}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5" /> Mô tả chi tiết
                                </h3>
                                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line min-h-[60px]">
                                    {task.description || <span className="text-slate-400 italic text-xs">Không có mô tả.</span>}
                                </div>
                            </div>

                            {/* Footer Security */}
                            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-200 border-dashed">
                                <Shield className="w-3 h-3" />
                                <span>Bảo mật cấp: <b>{task.assignments?.[0]?.requiredMinSecurity || 1}</b></span>
                            </div>
                        </TabsContent>

                        {/* TAB: COMMENTS */}
                        <TabsContent value="comments" className="mt-0">
                            <TaskCommentsTab taskId={task.id} />
                        </TabsContent>

                    </div>
                </Tabs>
            </>
        )}
    </div>
  );
};