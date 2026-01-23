"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { format } from 'date-fns';
import { 
  List as ListIcon, FileText, Clock, ChevronRight, ChevronDown, 
  CircleCheck, Users as UsersIcon, Building2, Mail 
} from "lucide-react";
import { taskApi, Task } from "@/entities/task";
import { biddingProjectApi } from "@/entities/bidding-project"; 
import { organizationApi } from "@/entities/organization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { AutoFetchFileCell } from "./auto-fetch-file-cell"; 
import { TaskDetailPanel } from "./task-detail-panel"; 
import { TaskFileSection } from "./task-file-section"; 

interface ProjectTaskListProps {
  projectId: number;
  driveFolderId?: string; 
  projectName?: string; 
}

const FILE_ONLY_TASKS = ["hồ sơ pháp lý", "hồ sơ tài chính", "báo cáo tài chính"];

const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING_REVIEW": return "bg-[#009d98]/10 text-[#009d98] border-[#009d98]/20";
      case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200";
      case "ASSIGNED": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "OPEN": return "bg-slate-100 text-slate-600 border-slate-200";
      case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-50 text-slate-500 border-slate-200";
    }
};

const getRoleBadgeColor = (role: string) => {
    switch (role) {
        case "BID_MANAGER": return "bg-purple-50 text-purple-700 border-purple-200";
        case "MANAGER": return "bg-red-50 text-red-700 border-red-200";
        case "SPECIALIST": return "bg-[#009d98]/10 text-[#009d98] border-[#009d98]/20";
        case "ENGINEER": return "bg-slate-100 text-slate-700 border-slate-200";
        default: return "bg-slate-50 text-slate-500";
    }
};

// --- [UPDATE] TASK ROW ITEM: Mobile Flex, Desktop Grid ---
const TaskRowItem = ({ task, unitMap, isExpanded, onToggleExpand, onSelect, selectedId, isSubTask = false }: any) => {
    const displayStatus = task.isFileTask ? "COMPLETED" : task.status;
    const displayProgress = task.isFileTask ? 100 : task.progress;
    
    // Render Helper
    const renderAssignee = () => {
        if (!isSubTask) {
            if (task.isFileTask) {
                // [FIX] Thêm min-w-0 để tránh tràn file name
                return <div onClick={e => e.stopPropagation()} className="min-w-0"><AutoFetchFileCell taskName={task.taskName} /></div>;
            }
            let displayUnitName = task.assignments?.[0]?.unit?.unitName || (task.assignedUnitId ? unitMap[task.assignedUnitId] : null);
            if (displayUnitName) {
                return (
                    // [FIX] Thêm min-w-0 để truncate hoạt động
                    <div className="flex items-center gap-2 min-w-0" title={displayUnitName}>
                          <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                             <Building2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-500" />
                          </div>
                          <span className="truncate text-slate-700 font-medium text-xs">{displayUnitName}</span>
                    </div>
                );
            }
            return <span className="text-slate-300 italic text-[10px]">-- Chưa phân công --</span>;
        }

        const assignment = task.assignments?.[0];
        const user = assignment?.user;
        
        if (user?.fullName) {
             return (
                <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 rounded-full bg-[#009d98]/10 border border-[#009d98]/20 flex items-center justify-center shrink-0 overflow-hidden text-[#009d98] font-bold text-[10px]">
                        {user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" /> : user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate text-slate-700 text-xs font-medium" title={user.fullName}>{user.fullName}</span>
                </div>
             );
        }
        return <span className="text-slate-300 italic text-[10px]">-- Chưa giao --</span>;
    };

    return (
        <div 
            onClick={() => {
                if (!isSubTask && !task.isFileTask) onToggleExpand(task.id);
                if (isSubTask) onSelect(task.id); 
            }}
            className={cn(
                // [UPDATE] Mobile: flex-col, Desktop: grid-cols-12
                "flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 py-3 px-3 md:px-4 transition-all border-b border-slate-100 last:border-0 relative",
                !isSubTask && !task.isFileTask && "cursor-pointer hover:bg-slate-50",
                !isSubTask && !isExpanded && !task.isFileTask && "bg-white",
                !isSubTask && task.isFileTask && "bg-slate-50/50",
                isSubTask && "hover:bg-[#009d98]/5 cursor-pointer pl-8 md:pl-12 border-t border-slate-50",
                isSubTask && selectedId === task.id && "bg-[#009d98]/5 border-l-4 border-l-[#009d98] pl-7 md:pl-[44px]"
            )}
        >
            {/* Col 1: Name & Status (Mobile Header) */}
            <div className="md:col-span-6 flex items-start gap-2 md:gap-3 min-w-0 w-full">
                {!isSubTask && (
                     <button className={cn("text-slate-400 mt-0.5 md:mt-0 shrink-0", task.isFileTask && "opacity-0 cursor-default")}>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                )}
                {isSubTask && (
                     <div className="mt-0.5 md:mt-0 shrink-0">
                        {task.status === 'COMPLETED' 
                          ? <CircleCheck className="w-4 h-4 text-emerald-500" />
                          : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        }
                      </div>
                )}
                
                <div className="flex-1 min-w-0">
                    {/* Mobile: Status Badge floats right next to name */}
                    <div className="flex justify-between items-start gap-2">
                        <h3 className={cn("font-bold text-sm leading-snug truncate pr-2", isSubTask && selectedId === task.id ? "text-[#009d98]" : "text-slate-700")}>
                            {task.taskName}
                        </h3>
                        {/* Mobile Status Badge */}
                        <div className="md:hidden shrink-0">
                            <Badge variant="outline" className={cn("h-5 px-1.5 font-bold text-[9px] uppercase", getStatusColor(displayStatus))}>
                                {displayStatus}
                            </Badge>
                        </div>
                    </div>

                    {!isSubTask && (
                        <div className="flex items-center gap-2 mt-1.5 md:mt-1">
                             <div className="w-full md:w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn("h-full transition-all duration-500", displayProgress === 100 ? "bg-emerald-500" : "bg-[#009d98]")} style={{ width: `${displayProgress}%` }} />
                             </div>
                             <span className="text-[9px] text-slate-400 font-medium">{displayProgress}%</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Col 2,3,4: Details (Mobile Row) */}
            <div className="md:col-span-6 flex items-center justify-between md:grid md:grid-cols-6 gap-2 md:gap-4 w-full mt-1 md:mt-0">
                {/* [FIX] Assignee: Tăng lên col-span-3 (50%) + overflow-hidden để cắt chữ dài 
                */}
                <div className="md:col-span-3 text-xs font-medium min-w-0 flex items-center overflow-hidden pr-2">
                    {renderAssignee()}
                </div>
                
                {/* [FIX] Deadline: Giảm xuống col-span-1 (vừa đủ cho ngày tháng) 
                */}
                <div className="md:col-span-1 text-xs text-slate-500 font-medium flex items-center md:justify-start">
                    {task.deadline ? (
                         <span className={cn("flex items-center gap-1.5 bg-slate-50 md:bg-transparent px-2 md:px-0 py-1 md:py-0 rounded", new Date(task.deadline) < new Date() && task.status !== 'COMPLETED' ? "text-red-600 font-bold" : "")}>
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="whitespace-nowrap">{format(new Date(task.deadline), "dd/MM")}</span>
                         </span>
                    ) : <span className="text-slate-300">--</span>}
                </div>

                {/* Status (Desktop Only): Giữ nguyên col-span-2 */}
                <div className="hidden md:block md:col-span-2 text-right pr-4">
                      <Badge variant="outline" className={cn("h-5 px-2 font-bold text-[9px] uppercase shadow-none border shrink-0 inline-flex", getStatusColor(displayStatus))}>
                        {displayStatus}
                    </Badge>
                </div>
            </div>
        </div>
    );
};

// --- [UPDATE] PERSONNEL LIST: Mobile Card ---
const ProjectPersonnelList = ({ projectId }: { projectId: number }) => {
    const { data: personnel = [], isLoading } = useQuery({
        queryKey: ["project-personnel", projectId],
        queryFn: () => biddingProjectApi.getPersonnel(projectId),
    });

    if (isLoading) return <div className="text-center p-10 text-slate-400 text-xs">Đang tải...</div>;
    if (personnel.length === 0) return <div className="p-10 text-center text-slate-400 italic text-sm">Chưa có nhân sự.</div>;

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden m-1">
             {/* Header: Hidden on mobile */}
             <div className="hidden md:grid grid-cols-12 gap-4 p-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                <div className="col-span-4 pl-4">Họ và tên</div>
                <div className="col-span-3">Vai trò</div>
                <div className="col-span-3">Đơn vị / Chức vụ</div>
                <div className="col-span-2">Liên hệ</div>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-350px)] custom-scrollbar divide-y divide-slate-100">
                {personnel.map((p) => (
                    // [UPDATE] Mobile Layout
                    <div key={p.userId} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 md:py-3 md:px-4 items-start md:items-center hover:bg-slate-50 transition-colors">
                        <div className="md:col-span-4 flex items-center gap-3 w-full">
                             <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-slate-600 font-bold text-xs">
                                {p.avatarUrl ? <img src={p.avatarUrl} alt={p.fullName} className="h-full w-full object-cover" /> : p.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">{p.fullName}</p>
                                {/* Mobile: Job Title moved here */}
                                <p className="md:hidden text-xs text-slate-500 mt-0.5">{p.jobTitle}</p>
                            </div>
                            {/* Mobile: Role Badge top right */}
                            <div className="md:hidden">
                                <Badge variant="outline" className={cn("h-5 px-2 text-[9px]", getRoleBadgeColor(p.role))}>{p.role}</Badge>
                            </div>
                        </div>
                        <div className="hidden md:block col-span-3">
                            <Badge variant="outline" className={cn("h-5 px-2 font-bold text-[9px] uppercase shadow-none", getRoleBadgeColor(p.role))}>{p.role}</Badge>
                        </div>
                        <div className="col-span-12 md:col-span-3 w-full">
                            <div className="flex flex-row md:flex-col gap-2 md:gap-0.5 items-center md:items-start text-xs text-slate-600">
                                 <span className="font-bold flex items-center gap-1.5"><Building2 className="w-3 h-3 text-slate-400" />{p.orgUnitName}</span>
                                 <span className="hidden md:block text-[10px] text-slate-500 pl-4.5">{p.jobTitle}</span>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-2 w-full">
                            <div className="flex items-center gap-1.5 text-xs text-[#009d98] hover:underline cursor-pointer bg-slate-50 md:bg-transparent px-2 py-1 md:p-0 rounded w-fit">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="truncate font-medium">{p.email.split('@')[0]}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export const ProjectTaskList = ({ projectId, driveFolderId, projectName }: ProjectTaskListProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null); 
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskApi.getList(projectId),
    enabled: !!projectId,
  });

  const { data: unitMap = {} } = useQuery({
    queryKey: ["all-org-units-map"],
    queryFn: async () => { /* ... giữ nguyên logic fetch ... */ return {}; }, 
  });

  const roadmapData = useMemo(() => {
    return tasks.map(parent => {
      // ... giữ nguyên logic ...
      const parentNameLower = parent.taskName.toLowerCase();
      const isFileTask = FILE_ONLY_TASKS.some(key => parentNameLower.includes(key));
      const subTasks = parent.subTasks || []; 
      const total = subTasks.length;
      const completed = subTasks.filter(st => st.status === 'COMPLETED').length;
      let progress = isFileTask ? 100 : (total > 0 ? Math.round((completed / total) * 100) : 0);
      return { ...parent, displaySubTasks: subTasks, progress, isFileTask };
    });
  }, [tasks]); 

  // ... useEffect expand logic ...

  const toggleExpand = (parentId: number) => {
     const newSet = new Set(expandedParents);
     if (newSet.has(parentId)) newSet.delete(parentId);
     else newSet.add(parentId);
     setExpandedParents(newSet);
  };

  if (isLoading) return <div className="text-center p-10 text-slate-400 text-sm">Đang tải...</div>;

  return (
    <div className="relative flex h-full overflow-hidden bg-slate-50 w-full">
      {/* [UPDATE] Layout Container
          - Mobile: w-full (Panel sẽ đè lên hoặc dùng fixed)
          - Desktop: mr-[450px] khi chọn Task
      */}
      <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out h-full", 
          // p-6 desk -> p-2 mobile
          "p-2 md:p-6 md:pt-4",
          selectedTaskId ? "w-full md:mr-[450px]" : "w-full"
      )}>
        <Tabs defaultValue="roadmap" className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0">
              {/* [UPDATE] Scrollable Tabs for Mobile */}
              <div className="w-full overflow-x-auto no-scrollbar">
                  <TabsList className="bg-white border border-slate-200 p-1 rounded-lg h-9 shadow-sm w-full md:w-auto flex justify-start">
                    <TabsTrigger value="roadmap" className="flex-1 md:flex-none gap-2 text-[10px] md:text-[11px] h-7">
                      <ListIcon className="h-3.5 w-3.5" /> Roadmap
                    </TabsTrigger>
                    <TabsTrigger value="personnel" className="flex-1 md:flex-none gap-2 text-[10px] md:text-[11px] h-7">
                      <UsersIcon className="h-3.5 w-3.5" /> Nhân sự
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex-1 md:flex-none gap-2 text-[10px] md:text-[11px] h-7">
                      <FileText className="h-3.5 w-3.5" /> Files
                    </TabsTrigger>
                  </TabsList>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <TabsContent value="roadmap" className="absolute inset-0 overflow-y-auto pr-1 md:pr-2 custom-scrollbar mt-0 pb-20 md:pb-4 focus-visible:outline-none">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Header Table: Hidden on Mobile */}
                    <div className="hidden md:grid grid-cols-12 gap-4 p-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                        <div className="col-span-6 pl-10">Hạng mục công việc</div>
                        {/* [UPDATE HEADER] Điều chỉnh lại header cho khớp với row bên dưới */}
                        <div className="col-span-3">Phụ trách / Hồ sơ</div>
                        <div className="col-span-1">Hạn chót</div>
                        <div className="col-span-2 text-right pr-4">Trạng thái</div>
                    </div>
                    {roadmapData.length === 0 && <div className="text-center py-20 text-slate-400 text-sm">Không có dữ liệu.</div>}
                    {roadmapData.map((parent) => (
                        <div key={parent.id}>
                            <TaskRowItem 
                                task={parent} 
                                unitMap={unitMap} 
                                isExpanded={expandedParents.has(parent.id)}
                                onToggleExpand={toggleExpand}
                                onSelect={() => {}} 
                            />
                            {expandedParents.has(parent.id) && !parent.isFileTask && (
                                <div className="bg-white">
                                    {parent.displaySubTasks.length > 0 ? (
                                        parent.displaySubTasks.map((sub: Task) => (
                                            <TaskRowItem 
                                                key={sub.id} 
                                                task={sub} 
                                                unitMap={unitMap} 
                                                isExpanded={false}
                                                onToggleExpand={() => {}}
                                                onSelect={setSelectedTaskId} 
                                                selectedId={selectedTaskId || undefined}
                                                isSubTask={true}
                                            />
                                        ))
                                    ) : (
                                        <div className="py-3 pl-8 md:pl-12 text-xs text-slate-400 italic bg-slate-50/30">
                                            (Trống)
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="personnel" className="absolute inset-0 overflow-y-auto mt-0 pb-4">
                  <ProjectPersonnelList projectId={projectId} />
              </TabsContent>

              <TabsContent value="files" className="absolute inset-0 overflow-y-auto mt-0 pb-4 px-1">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 min-h-[400px]">
                      <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wide">
                          <FileText className="w-4 h-4 text-[#009d98]" /> Tài liệu dự án
                      </h3>
                      <TaskFileSection 
                          rootFolderId={driveFolderId} 
                          taskName={projectName || ""} 
                      />
                  </div>
              </TabsContent>
            </div>
        </Tabs>
      </div>

      {/* --- SIDE PANEL --- */}
      <TaskDetailPanel 
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
};