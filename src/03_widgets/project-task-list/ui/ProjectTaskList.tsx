"use client";

import React, { useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import { taskApi, Task } from "@/entities/task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { 
  Columns, 
  List as ListIcon, 
  FileText, 
  Clock, 
  AlertCircle, 
  Lightbulb, 
  User as UserIcon 
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from "@/shared/lib/utils";

interface ProjectTaskListProps {
  projectId: number;
}

export const ProjectTaskList = ({ projectId }: ProjectTaskListProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskApi.getList(projectId),
    enabled: !!projectId,
  });

  const tasks = data || [];

  const roadmapData = useMemo(() => {
    const parents = tasks.filter(t => t.parentTaskId === 0 || t.parentTaskId === null);
    return parents.map(parent => ({
      ...parent,
      displaySubTasks: tasks.filter(t => t.parentTaskId === parent.id)
    }));
  }, [tasks]);

  const timeLeft = useMemo(() => {
    if (tasks.length === 0) return null;
    const futureDeadlines = tasks
      .map(t => t.deadline ? new Date(t.deadline).getTime() : 0)
      .filter(d => d > Date.now());
    if (futureDeadlines.length === 0) return "Hết hạn";
    const minDeadline = Math.min(...futureDeadlines);
    return formatDistanceToNow(new Date(minDeadline), { locale: vi });
  }, [tasks]);

  if (isLoading) return <div className="p-10 text-center animate-pulse text-slate-400">Đang đồng bộ...</div>;

  return (
    // [FIX] Cố định chiều cao container bằng chiều cao màn hình trừ đi phần header/nav (khoảng 200px)
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)] overflow-hidden">
      
      {/* CỘT TRÁI: CHIẾM 8 CỘT */}
      <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
        <Tabs defaultValue="roadmap" className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <TabsList className="bg-slate-100/50 border p-1 rounded-lg">
              <TabsTrigger value="roadmap" className="gap-2 font-bold text-xs uppercase tracking-tighter">
                <ListIcon className="h-3.5 w-3.5" /> ROADMAP
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-2 font-bold text-xs uppercase tracking-tighter">
                <Columns className="h-3.5 w-3.5" /> KANBAN
              </TabsTrigger>
              <TabsTrigger value="files" className="gap-2 font-bold text-xs uppercase tracking-tighter">
                <FileText className="h-3.5 w-3.5" /> FILES
              </TabsTrigger>
            </TabsList>
          </div>

          {/* [FIX] Phần nội dung Tab sẽ có thanh cuộn riêng */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <TabsContent value="roadmap" className="mt-0 space-y-10 pb-10 focus-visible:outline-none">
              {roadmapData.length === 0 && (
                <div className="text-center py-20 bg-white border-2 border-dashed rounded-3xl text-slate-400">
                  Dữ liệu trống
                </div>
              )}

              {roadmapData.map((parent) => {
                const subTasks = parent.displaySubTasks;
                const completedCount = subTasks.filter(st => st.status === 'COMPLETED').length;

                return (
                  <div key={parent.id} className="space-y-4">
                    <div className="flex justify-between items-center sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10 py-1">
                      <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest">
                        {parent.taskName}
                      </h3>
                      <div className="text-[9px] font-black text-slate-500 bg-white border px-2 py-1 rounded-md shadow-sm">
                        {completedCount}/{subTasks.length} HOÀN THÀNH
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      {subTasks.map((sub) => (
                        <Card key={sub.id} className="border-slate-200/60 shadow-none hover:shadow-lg hover:shadow-blue-500/5 transition-all rounded-2xl">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-start gap-4 overflow-hidden">
                              <div className={cn(
                                "w-1.5 h-10 rounded-full shrink-0",
                                sub.status === 'COMPLETED' ? "bg-emerald-500" : "bg-blue-400/20"
                              )} />
                              <div className="space-y-1 overflow-hidden">
                                <h4 className="font-bold text-slate-800 text-sm truncate">{sub.taskName}</h4>
                                <div className="flex items-center gap-3 text-[11px]">
                                  <Badge className={cn(
                                    "h-4 px-1.5 text-[9px] font-bold uppercase border-none shadow-none",
                                    sub.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                  )}>
                                    {sub.status === 'COMPLETED' ? 'DONE' : 'IN PROGRESS'}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-slate-400 font-bold">
                                    <Clock className="h-3 w-3" /> 
                                    {sub.deadline ? new Date(sub.deadline).toLocaleDateString('vi-VN') : '--/--'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-500 shadow-sm">
                               {sub.assigneeId ? `U${sub.assigneeId}` : <UserIcon className="h-3.5 w-3.5 text-slate-300" />}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            {/* [FIX] Xóa bỏ 2 cục mockup to đùng ở cuối, thay bằng Empty State tối giản */}
            <TabsContent value="kanban" className="text-center py-20 text-slate-400 italic text-xs">
              Đang đồng bộ dữ liệu Kanban...
            </TabsContent>
            <TabsContent value="files" className="text-center py-20 text-slate-400 italic text-xs">
              Chưa có tài liệu đính kèm.
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* CỘT PHẢI: SIDEBAR (CỐ ĐỊNH) */}
      <div className="col-span-12 lg:col-span-4 space-y-6 overflow-hidden">
        <Card className="bg-red-50/50 border-red-100 shadow-none ring-1 ring-red-100">
          <CardContent className="p-6 flex flex-col items-center text-center">
             <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Thời gian còn lại</span>
             <div className="text-red-600 font-black text-3xl tracking-tighter uppercase leading-none">
               {timeLeft || "---"}
             </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-800 uppercase px-1 tracking-widest">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Health Check
          </div>
          
          <div className="space-y-3">
            <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200">
              <CardContent className="p-4 flex gap-4">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-slate-800 uppercase">Thiếu chứng chỉ</p>
                  <p className="text-[10px] text-slate-500 leading-normal">Dữ liệu nhân sự chưa đủ Chỉ huy trưởng hạng I.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200">
              <CardContent className="p-4 flex gap-4">
                <Lightbulb className="h-5 w-5 text-blue-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-slate-800 uppercase">Gợi ý AI</p>
                  <p className="text-[10px] text-slate-500 italic leading-normal font-medium">Tham khảo biện pháp thi công dự án trường học 2024.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};