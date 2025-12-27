"use client";

import React, { useMemo, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { format } from 'date-fns';
import { 
  Columns, 
  List as ListIcon, 
  FileText, 
  Clock, 
  User as UserIcon,
  X as XIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  ChevronRight,
  ChevronDown,
  CircleCheck 
} from "lucide-react";

// --- IMPORTS ---
import { taskApi, Task } from "@/entities/task";
import { organizationApi } from "@/entities/organization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

// Component tự động lấy file
import { AutoFetchFileCell } from "./auto-fetch-file-cell"; 

interface ProjectTaskListProps {
  projectId: number;
}

// --- CONFIG ---

// [SỬA TẠI ĐÂY] Chỉ giữ lại 2 loại hồ sơ đặc biệt này
const FILE_ONLY_TASKS = ["Hồ sơ pháp lý", "Hồ sơ tài chính"];

// Map màu sắc trạng thái
const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING_REVIEW": return "bg-purple-50 text-purple-700 border-purple-200";
      case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200";
      case "ASSIGNED": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "OPEN": return "bg-slate-100 text-slate-600 border-slate-200";
      case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-50 text-slate-500 border-slate-200";
    }
};

export const ProjectTaskList = ({ projectId }: ProjectTaskListProps) => {
  // --- STATE ---
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());

  // --- QUERY 1: FETCH TASKS ---
  const { data, isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskApi.getList(projectId),
    enabled: !!projectId,
  });

  const tasks = data || [];

  // --- QUERY 2: FETCH ALL UNITS ---
  const { data: unitMap = {} } = useQuery({
    queryKey: ["all-org-units-map"],
    queryFn: async () => {
        const boards = await organizationApi.getBoards();
        const deptPromises = boards.map(b => organizationApi.getDepartments(b.unitId).catch(() => []));
        const deptResults = await Promise.all(deptPromises);
        const allDepts = deptResults.flat();
        const allUnits = [...boards, ...allDepts];
        
        const map: Record<number, string> = {};
        allUnits.forEach(u => { map[u.unitId] = u.unitName; });
        return map;
    },
    staleTime: 10 * 60 * 1000, 
  });

  // --- MEMO: PROCESSING DATA ---
  const roadmapData = useMemo(() => {
    const processed = tasks.map(parent => {
      // 1. Kiểm tra xem đây có phải là Task đặc biệt (chỉ có file) không
      const isFileTask = FILE_ONLY_TASKS.some(t => parent.taskName.includes(t));

      const subTasks = parent.subTasks || []; 
      const total = subTasks.length;
      const completed = subTasks.filter(st => st.status === 'COMPLETED').length;
      
      // [LOGIC TIẾN ĐỘ]
      let progress = 0;
      if (isFileTask) {
          // Nếu là hồ sơ đặc biệt -> Luôn là 100%
          progress = 100;
      } else {
          // Nếu là task thường (Nhân sự, Thi công...): Tính theo subtask
          progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      }

      const assignedUnitId = parent.assignments?.[0]?.assignedUnitId;

      return {
        ...parent,
        assignedUnitId,
        displaySubTasks: subTasks, 
        progress,
        completedCount: completed,
        isFileTask 
      };
    });

    // Mặc định mở tất cả khi load xong (trừ các task FileOnly)
    if (expandedParents.size === 0 && processed.length > 0) {
        const normalTaskIds = new Set(processed.filter(p => !p.isFileTask).map(p => p.id));
        setExpandedParents(normalTaskIds);
    }

    return processed;
  }, [tasks]); 

  // --- ACTIONS ---
  const toggleExpand = (parentId: number) => {
      const newSet = new Set(expandedParents);
      if (newSet.has(parentId)) newSet.delete(parentId);
      else newSet.add(parentId);
      setExpandedParents(newSet);
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-slate-400">Đang đồng bộ...</div>;

  return (
    <div className="relative flex h-full overflow-hidden bg-slate-50">
      
      {/* --- MAIN CONTENT AREA --- */}
      <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out p-6 pt-2",
          selectedTask ? "mr-[400px]" : "" 
      )}>
        
        <Tabs defaultValue="roadmap" className="flex flex-col h-full w-full">
            
            {/* TABS HEADER */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <TabsList className="bg-white border p-1 rounded-lg h-9 shadow-sm">
                <TabsTrigger value="roadmap" className="gap-2 font-bold text-[11px] uppercase tracking-tighter h-7 data-[state=active]:bg-slate-100">
                  <ListIcon className="h-3.5 w-3.5" /> Roadmap
                </TabsTrigger>
                <TabsTrigger value="kanban" className="gap-2 font-bold text-[11px] uppercase tracking-tighter h-7 data-[state=active]:bg-slate-100">
                  <Columns className="h-3.5 w-3.5" /> Kanban
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-2 font-bold text-[11px] uppercase tracking-tighter h-7 data-[state=active]:bg-slate-100">
                  <FileText className="h-3.5 w-3.5" /> Files
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TABS CONTENT */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <TabsContent value="roadmap" className="mt-0 pb-10 focus-visible:outline-none">
                
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    
                    {/* TABLE HEADER */}
                    <div className="grid grid-cols-12 gap-4 p-3 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                        <div className="col-span-6 pl-10">Hạng mục công việc</div>
                        <div className="col-span-2">Phụ trách / Hồ sơ</div>
                        <div className="col-span-2">Hạn chót</div>
                        <div className="col-span-2 text-right pr-4">Trạng thái</div>
                    </div>

                    {roadmapData.length === 0 && <div className="text-center py-20 text-slate-400">Dữ liệu trống</div>}

                    {/* LIST ROWS */}
                    {roadmapData.map((parent) => {
                      const isExpanded = expandedParents.has(parent.id);
                      const unitName = parent.assignedUnitId ? unitMap[parent.assignedUnitId] : null;
                      
                      // Nếu là FileTask -> COMPLETED. Ngược lại lấy status thật từ DB
                      const displayStatus = parent.isFileTask ? "COMPLETED" : parent.status;
                      
                      // Nếu là FileTask -> 100%. Ngược lại lấy progress tính toán từ subtask
                      const displayProgress = parent.isFileTask ? 100 : parent.progress;

                      return (
                        <div key={parent.id} className="group border-b border-slate-100 last:border-0">
                            
                            {/* 1. PARENT ROW */}
                            <div 
                                // Disable click nếu là FileTask
                                onClick={() => !parent.isFileTask && toggleExpand(parent.id)}
                                className={cn(
                                    "grid grid-cols-12 gap-4 py-3 px-4 items-center transition-colors hover:bg-slate-50",
                                    !parent.isFileTask && "cursor-pointer", 
                                    (!isExpanded && !parent.isFileTask) && "bg-slate-50/50",
                                    parent.isFileTask && "bg-emerald-50/20" // Highlight nhẹ
                                )}
                            >
                                {/* Cột 1: Tên & Progress */}
                                <div className="col-span-6 flex items-center gap-3">
                                    {/* Nút mở rộng: Ẩn nếu là FileTask */}
                                    <button className={cn("text-slate-400 transition-colors", parent.isFileTask && "opacity-0 cursor-default")}>
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </button>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800 text-sm">{parent.taskName}</h3>
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                                // Nếu 100% -> Màu xanh, ngược lại màu xám
                                                displayProgress === 100 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {displayProgress}%
                                            </span>
                                        </div>
                                        <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                            <div 
                                                className={cn(
                                                    "h-full transition-all duration-500", 
                                                    // Nếu 100% -> Thanh màu xanh lá, ngược lại màu xanh dương
                                                    displayProgress === 100 ? "bg-emerald-500" : "bg-blue-600"
                                                )} 
                                                style={{ width: `${displayProgress}%` }} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Cột 2: Đơn vị phụ trách HOẶC File */}
                                <div className="col-span-2 text-xs text-slate-500 font-medium">
                                    {unitName ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0"></div>
                                            <span className="truncate" title={unitName}>{unitName}</span>
                                        </div>
                                    ) : (
                                        // Vẫn hiển thị File nếu tìm thấy (áp dụng cho cả Task thường và Task đặc biệt nếu có file)
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <AutoFetchFileCell taskName={parent.taskName} />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Cột 3: Deadline */}
                                <div className="col-span-2 text-xs text-slate-500 font-medium">
                                   {parent.deadline ? format(new Date(parent.deadline), "dd/MM") : "--"}
                                </div>

                                {/* Cột 4: Status */}
                                <div className="col-span-2 text-right pr-4">
                                    <Badge className={cn(
                                        "h-5 px-2 font-bold text-[9px] uppercase border shadow-none",
                                        getStatusColor(displayStatus)
                                    )}>
                                        {displayStatus}
                                    </Badge>
                                </div>
                            </div>

                            {/* 2. SUB TASKS (Chỉ hiện nếu KHÔNG phải FileTask) */}
                            {isExpanded && !parent.isFileTask && (
                                <div className="bg-white">
                                    {parent.displaySubTasks.length > 0 ? (
                                        parent.displaySubTasks.map((sub) => (
                                            <div 
                                                key={sub.id}
                                                onClick={() => setSelectedTask(sub)}
                                                className={cn(
                                                    "grid grid-cols-12 gap-4 py-3 px-4 pl-12 items-center border-t border-slate-50 hover:bg-blue-50/50 cursor-pointer transition-colors group/row",
                                                    selectedTask?.id === sub.id ? "bg-blue-50 border-l-4 border-l-blue-500 pl-[44px]" : "border-l-4 border-l-transparent"
                                                )}
                                            >
                                                {/* Tên Subtask */}
                                                <div className="col-span-6 flex items-center gap-3">
                                                    {sub.status === 'COMPLETED' ? (
                                                        <CircleCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                                                    )}
                                                    <span className={cn(
                                                        "text-sm font-medium truncate transition-colors",
                                                        selectedTask?.id === sub.id ? "text-blue-700 font-bold" : "text-slate-600 group-hover/row:text-slate-900",
                                                        sub.status === 'COMPLETED' && "text-slate-400 line-through decoration-slate-300"
                                                    )}>
                                                        {sub.taskName}
                                                    </span>
                                                </div>

                                                {/* User Subtask */}
                                                <div className="col-span-2 flex items-center gap-2">
                                                    {sub.assigneeId ? (
                                                        <>
                                                            <div className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                                                                U{sub.assigneeId}
                                                            </div>
                                                            <span className="text-xs text-slate-600 truncate max-w-[80px]">User {sub.assigneeId}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-slate-300 italic flex items-center gap-1">
                                                            <UserIcon className="w-3 h-3" /> --
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Deadline Subtask */}
                                                <div className="col-span-2 text-xs text-slate-500 font-medium">
                                                    {sub.deadline ? (
                                                        <span className={cn("flex items-center gap-1.5", new Date(sub.deadline) < new Date() && sub.status !== 'COMPLETED' ? "text-red-600 font-bold" : "")}>
                                                            <Clock className="w-3 h-3 text-slate-400" />
                                                            {format(new Date(sub.deadline), 'dd/MM')}
                                                        </span>
                                                    ) : <span className="text-slate-300 italic">--/--</span>}
                                                </div>

                                                {/* Status Subtask */}
                                                <div className="col-span-2 text-right pr-4">
                                                    <Badge className={cn("h-5 px-2 font-bold text-[9px] uppercase border shadow-none", getStatusColor(sub.status))}>
                                                        {sub.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-3 pl-12 text-xs text-slate-400 italic border-t border-slate-50">
                                            (Chưa có công việc con)
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                      );
                    })}
                </div>
              </TabsContent>
              
              <TabsContent value="kanban" className="text-center py-20 text-slate-400 italic text-xs">
                Đang đồng bộ dữ liệu Kanban...
              </TabsContent>
              <TabsContent value="files" className="text-center py-20 text-slate-400 italic text-xs">
                Chưa có tài liệu đính kèm.
              </TabsContent>
            </div>
        </Tabs>
      </div>

      {/* --- SLIDE-OVER PANEL CHI TIẾT --- */}
      <div className={cn(
          "absolute top-0 right-0 bottom-0 w-[400px] bg-white border-l shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          selectedTask ? "translate-x-0" : "translate-x-full"
      )}>
        {selectedTask && (
            <>
                <div className="p-5 border-b flex justify-between items-start bg-slate-50">
                    <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-2">
                             <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase border", getStatusColor(selectedTask.status))}>
                                {selectedTask.status}
                             </div>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight mb-1">{selectedTask.taskName}</h2>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Hạn chót: {selectedTask.deadline ? format(new Date(selectedTask.deadline), 'dd/MM/yyyy') : 'Chưa đặt'}
                        </span>
                    </div>
                    <button onClick={() => setSelectedTask(null)} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <Tabs defaultValue="files" className="flex-1 flex flex-col min-h-0">
                    <div className="px-5 border-b bg-white">
                        <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-6">
                            <TabsTrigger value="files" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-0 font-bold text-xs uppercase">
                                Tài liệu
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-0 font-bold text-xs uppercase">
                                Trao đổi
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-5">
                        <TabsContent value="files" className="mt-0 space-y-4">
                            {/* DEMO FILES (Placeholder cho chi tiết subtask) */}
                            <div className="bg-white border rounded-xl p-4 flex items-center gap-3 shadow-sm hover:border-blue-300 transition-colors cursor-pointer group">
                                <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center border border-red-100 shrink-0">
                                    <FileText className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-700">Tai_lieu_nghiep_vu.pdf</p>
                                    <p className="text-[10px] text-slate-400">System generated</p>
                                </div>
                                <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-600">
                                    <DownloadIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </TabsContent>

                        <TabsContent value="activity" className="mt-0 h-full flex flex-col">
                            <div className="flex-1 space-y-4">
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">AI</div>
                                    <div className="bg-white border p-3 rounded-2xl rounded-tl-none shadow-sm text-sm max-w-[85%]">
                                        <p className="font-bold text-xs mb-1 text-slate-800">Trợ lý AI</p>
                                        <p className="text-slate-600 text-xs leading-relaxed">Nhắc nhở: Công việc này sắp đến hạn vào ngày mai.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex gap-2 pt-4 border-t border-slate-200">
                                <input type="text" placeholder="Nhập tin nhắn..." className="flex-1 bg-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"><SendIcon className="w-4 h-4" /></button>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </>
        )}
      </div>

    </div>
  );
};