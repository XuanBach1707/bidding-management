"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { format } from 'date-fns';
import { 
  List as ListIcon, 
  FileText, 
  Clock, 
  ChevronRight,
  ChevronDown,
  CircleCheck,
  Users as UsersIcon,
  Building2,
  Mail
} from "lucide-react";

// Imports Entities
import { taskApi, Task } from "@/entities/task";
import { biddingProjectApi } from "@/entities/bidding-project"; 
import { organizationApi } from "@/entities/organization";

// Imports UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

// Sub-components
import { AutoFetchFileCell } from "./auto-fetch-file-cell"; 
import { TaskDetailPanel } from "./task-detail-panel"; 
import { TaskFileSection } from "./task-file-section"; // Dùng lại cho tab Main Files

interface ProjectTaskListProps {
  projectId: number;
  driveFolderId?: string; 
  projectName?: string; // [MỚI] Nhận thêm tên dự án để tìm folder nếu cần
}

// --- CONSTANTS ---
const FILE_ONLY_TASKS = ["hồ sơ pháp lý", "hồ sơ tài chính", "báo cáo tài chính"];

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

const getRoleBadgeColor = (role: string) => {
    switch (role) {
        case "BID_MANAGER": return "bg-purple-100 text-purple-700 border-purple-200";
        case "MANAGER": return "bg-red-100 text-red-700 border-red-200";
        case "SPECIALIST": return "bg-blue-100 text-blue-700 border-blue-200";
        case "ENGINEER": return "bg-slate-100 text-slate-700 border-slate-200";
        default: return "bg-slate-50 text-slate-500";
    }
};

// --- SUB COMPONENT: TASK ROW ---
interface TaskRowItemProps {
    task: any; 
    unitMap: Record<number, string>;
    isExpanded: boolean;
    onToggleExpand: (id: number) => void;
    onSelect: (taskId: number) => void; // [SỬA] Chỉ truyền ID
    selectedId?: number;
    isSubTask?: boolean;
}

const TaskRowItem = ({ task, unitMap, isExpanded, onToggleExpand, onSelect, selectedId, isSubTask = false }: TaskRowItemProps) => {
    const displayStatus = task.isFileTask ? "COMPLETED" : task.status;
    const displayProgress = task.isFileTask ? 100 : task.progress;
    
    const renderAssignee = () => {
        if (!isSubTask) {
            if (task.isFileTask) {
                return <div onClick={e => e.stopPropagation()}><AutoFetchFileCell taskName={task.taskName} /></div>;
            }
            let displayUnitName = task.assignments?.[0]?.unit?.unitName;
            if (!displayUnitName && task.assignedUnitId) {
                displayUnitName = unitMap[task.assignedUnitId];
            }
            if (displayUnitName) {
                return (
                    <div className="flex items-center gap-1.5" title={displayUnitName}>
                         <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                         </div>
                         <span className="truncate text-slate-700 font-medium">{displayUnitName}</span>
                    </div>
                );
            }
            return <span className="text-slate-300 italic text-[10px]">-- Chưa phân công --</span>;
        }

        const assignment = task.assignments?.[0];
        const user = assignment?.user;
        const userId = assignment?.assignedUserId;

        if (user?.fullName) {
             return (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {user.avatarUrl ? (
                            <img 
                                src={user.avatarUrl} 
                                alt={user.fullName} 
                                className="h-full w-full object-cover" 
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                            />
                        ) : (
                            <span className="text-[10px] font-bold text-indigo-700">{user.fullName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <span className="truncate text-slate-700" title={user.fullName}>{user.fullName}</span>
                </div>
             );
        }

        if (userId) {
            return (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">U{userId}</div>
                     <span className="truncate text-slate-500">User {userId}</span>
                </div>
            )
        }
        return <span className="text-slate-300 italic text-[10px]">-- Chưa giao --</span>;
    };

    return (
        <div 
            onClick={() => {
                if (!isSubTask && !task.isFileTask) onToggleExpand(task.id);
                if (isSubTask) onSelect(task.id); // [SỬA] Truyền ID
            }}
            className={cn(
                "grid grid-cols-12 gap-4 py-3 px-4 items-center transition-colors border-b border-slate-100 last:border-0",
                !isSubTask && !task.isFileTask && "cursor-pointer hover:bg-slate-50",
                !isSubTask && !isExpanded && !task.isFileTask && "bg-slate-50/50",
                !isSubTask && task.isFileTask && "bg-emerald-50/20",
                isSubTask && "hover:bg-blue-50/50 cursor-pointer pl-12 border-t border-slate-50",
                isSubTask && selectedId === task.id && "bg-blue-50 border-l-4 border-l-blue-500 pl-[44px]"
            )}
        >
            {/* ... (Phần render cột tên và progress giữ nguyên) ... */}
            <div className="col-span-6 flex items-center gap-3">
                {!isSubTask && (
                     <button className={cn("text-slate-400 transition-colors", task.isFileTask && "opacity-0 cursor-default")}>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                )}
                {isSubTask && (
                     task.status === 'COMPLETED' 
                     ? <CircleCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                     : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className={cn("font-medium text-sm truncate", isSubTask && selectedId === task.id ? "text-blue-700 font-bold" : "text-slate-700")}>
                            {task.taskName}
                        </h3>
                        {!isSubTask && (
                             <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", displayProgress === 100 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                                {displayProgress}%
                             </span>
                        )}
                    </div>
                    {!isSubTask && (
                        <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                            <div className={cn("h-full transition-all duration-500", displayProgress === 100 ? "bg-emerald-500" : "bg-blue-600")} style={{ width: `${displayProgress}%` }} />
                        </div>
                    )}
                </div>
            </div>

            <div className="col-span-2 text-xs font-medium">{renderAssignee()}</div>
            <div className="col-span-2 text-xs text-slate-500 font-medium">
                {task.deadline ? (
                     <span className={cn("flex items-center gap-1.5", new Date(task.deadline) < new Date() && task.status !== 'COMPLETED' ? "text-red-600 font-bold" : "")}>
                        <Clock className="w-3 h-3 text-slate-400" />
                        {format(new Date(task.deadline), "dd/MM")}
                     </span>
                ) : "--"}
            </div>
            <div className="col-span-2 text-right pr-4">
                 <Badge className={cn("h-5 px-2 font-bold text-[9px] uppercase border shadow-none", getStatusColor(displayStatus))}>
                    {displayStatus}
                </Badge>
            </div>
        </div>
    );
};

// --- SUB COMPONENT: PERSONNEL LIST ---
const ProjectPersonnelList = ({ projectId }: { projectId: number }) => {
    const { data: personnel = [], isLoading } = useQuery({
        queryKey: ["project-personnel", projectId],
        queryFn: () => biddingProjectApi.getPersonnel(projectId),
    });

    if (isLoading) return <div className="p-10 text-center animate-pulse text-slate-400">Đang tải danh sách nhân sự...</div>;
    if (personnel.length === 0) return <div className="p-10 text-center text-slate-400 italic">Chưa có nhân sự nào tham gia dự án.</div>;

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
             <div className="grid grid-cols-12 gap-4 p-3 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-4 pl-4">Họ và tên</div>
                <div className="col-span-3">Vai trò</div>
                <div className="col-span-3">Đơn vị / Chức vụ</div>
                <div className="col-span-2">Liên hệ</div>
            </div>
            {personnel.map((p) => (
                <div key={p.userId} className="grid grid-cols-12 gap-4 py-3 px-4 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                            {p.avatarUrl ? (
                                <img src={p.avatarUrl} alt={p.fullName} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                                <span className="text-xs font-bold text-slate-600">{p.fullName.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div><p className="text-sm font-bold text-slate-700">{p.fullName}</p></div>
                    </div>
                    <div className="col-span-3">
                        <Badge className={cn("h-5 px-2 font-bold text-[9px] uppercase border shadow-none", getRoleBadgeColor(p.role))}>{p.role}</Badge>
                    </div>
                    <div className="col-span-3">
                        <div className="flex flex-col">
                             <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5"><Building2 className="w-3 h-3 text-slate-400" />{p.orgUnitName}</span>
                             <span className="text-[10px] text-slate-500 pl-4.5">{p.jobTitle}</span>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <div className="flex items-center gap-1 text-xs text-blue-600 hover:underline cursor-pointer" title={p.email}>
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{p.email.split('@')[0]}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- MAIN COMPONENT ---
export const ProjectTaskList = ({ projectId, driveFolderId, projectName }: ProjectTaskListProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null); // [SỬA] Lưu ID thay vì Object
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskApi.getList(projectId),
    enabled: !!projectId,
  });

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

  const roadmapData = useMemo(() => {
    return tasks.map(parent => {
      const parentNameLower = parent.taskName.toLowerCase();
      const isFileTask = FILE_ONLY_TASKS.some(key => parentNameLower.includes(key));
      const subTasks = parent.subTasks || []; 
      const total = subTasks.length;
      const completed = subTasks.filter(st => st.status === 'COMPLETED').length;
      let progress = 0;
      if (isFileTask) progress = 100;
      else progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { ...parent, displaySubTasks: subTasks, progress, isFileTask };
    });
  }, [tasks]); 

  useEffect(() => {
     if (roadmapData.length > 0 && expandedParents.size === 0) {
        const idsToExpand = roadmapData.filter(p => !p.isFileTask).map(p => p.id);
        setExpandedParents(new Set(idsToExpand));
     }
  }, [roadmapData]);

  const toggleExpand = (parentId: number) => {
     const newSet = new Set(expandedParents);
     if (newSet.has(parentId)) newSet.delete(parentId);
     else newSet.add(parentId);
     setExpandedParents(newSet);
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-slate-400">Đang đồng bộ...</div>;

  return (
    <div className="relative flex h-full overflow-hidden bg-slate-50">
      <div className={cn("flex-1 flex flex-col transition-all duration-300 ease-in-out p-6 pt-2", selectedTaskId ? "mr-[450px]" : "")}>
        <Tabs defaultValue="roadmap" className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <TabsList className="bg-white border p-1 rounded-lg h-9 shadow-sm">
                <TabsTrigger value="roadmap" className="gap-2 font-bold text-[11px] uppercase tracking-tighter h-7 data-[state=active]:bg-slate-100">
                  <ListIcon className="h-3.5 w-3.5" /> Roadmap
                </TabsTrigger>
                <TabsTrigger value="personnel" className="gap-2 font-bold text-[11px] uppercase tracking-tighter h-7 data-[state=active]:bg-slate-100">
                  <UsersIcon className="h-3.5 w-3.5" /> Nhân sự
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-2 font-bold text-[11px] uppercase tracking-tighter h-7 data-[state=active]:bg-slate-100">
                  <FileText className="h-3.5 w-3.5" /> Files
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <TabsContent value="roadmap" className="mt-0 pb-10 focus-visible:outline-none">
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-3 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                        <div className="col-span-6 pl-10">Hạng mục công việc</div>
                        <div className="col-span-2">Phụ trách / Hồ sơ</div>
                        <div className="col-span-2">Hạn chót</div>
                        <div className="col-span-2 text-right pr-4">Trạng thái</div>
                    </div>
                    {roadmapData.length === 0 && <div className="text-center py-20 text-slate-400">Dữ liệu trống</div>}
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
                                        <div className="py-3 pl-12 text-xs text-slate-400 italic border-t border-slate-50 border-b">
                                            (Chưa có công việc con)
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="personnel" className="mt-0 pb-10 focus-visible:outline-none">
                  <ProjectPersonnelList projectId={projectId} />
              </TabsContent>

              <TabsContent value="files" className="mt-0 pb-10 focus-visible:outline-none px-2">
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                      <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" /> Tài liệu dự án
                      </h3>
                      {/* [MỚI] Sử dụng lại TaskFileSection để list file của toàn bộ dự án */}
                      {/* Ta truyền tên rỗng hoặc tên dự án để nó list root */}
                      <TaskFileSection 
                          rootFolderId={driveFolderId} 
                          taskName={projectName || ""} // Trick: Tìm tương đối, nếu trống nó sẽ trả về thư mục gốc nếu logic find cho phép
                      />
                  </div>
              </TabsContent>
            </div>
        </Tabs>
      </div>

      {/* --- SIDE PANEL [GỌI API TRONG NÀY] --- */}
      <TaskDetailPanel 
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
};