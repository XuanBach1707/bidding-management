"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Plus, Trash2, Loader2, Calendar as CalendarIcon, 
  LayoutList
} from "lucide-react";

import { biddingProjectApi } from "@/entities/bidding-project";
import { taskApi, TaskAssignment } from "@/entities/task";
import { organizationApi, OrganizationUnit, UnitMember } from "@/entities/organization";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  hsmtId: number;
  defaultName: string; 
}

const FIXED_SECTIONS = [
  { id: "fixed_1", name: "Hồ sơ pháp lý", keywords: ["Pháp chế", "Hành chính", "Tổng hợp", "Pháp lý"] },
  { id: "fixed_2", name: "Hồ sơ nhân sự", keywords: ["Nhân sự", "Tổ chức"] },
  { id: "fixed_3", name: "Biện pháp thi công", keywords: ["Kỹ thuật", "Thi công", "Dự án"] },
  { id: "fixed_4", name: "Hồ sơ tài chính", keywords: ["Tài chính", "Kế toán"] },
  { id: "fixed_5", name: "Hồ sơ máy móc", keywords: ["Vật tư", "Thiết bị", "Cơ giới"] },
  { id: "fixed_6", name: "Hồ sơ hợp đồng & Tương tự", keywords: ["Đấu thầu", "Kinh doanh"] },
];

interface TempTask {
  id: string; 
  name: string;
  deadline: Date | undefined;
  parentId: string | null; 
  isFixed: boolean; 
  assignments: TaskAssignment[];
  assigneeId?: number; 
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  hsmtId, 
  defaultName 
}) => {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState(defaultName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [units, setUnits] = useState<OrganizationUnit[]>([]);
  const [tasks, setTasks] = useState<TempTask[]>([]);
  const [membersCache, setMembersCache] = useState<Record<number, UnitMember[]>>({});

  // --- LOGIC FETCH MEMBERS ---
  const loadMembers = async (unitId: number) => {
    if (membersCache[unitId]) return;
    try {
      const data = await organizationApi.getUnitMembers(unitId);
      setMembersCache(prev => ({ ...prev, [unitId]: data }));
    } catch (error) {
      console.error(`Lỗi load thành viên phòng ${unitId}`, error);
    }
  };

  // --- INIT DATA ---
  useEffect(() => {
    if (isOpen) {
      organizationApi.getAll().then((fetchedUnits) => {
        setUnits(fetchedUnits);

        const initialTasks: TempTask[] = FIXED_SECTIONS.map(s => {
          const matchedUnit = fetchedUnits.find(u => 
            s.keywords.some(k => u.unitName.toLowerCase().includes(k.toLowerCase()))
          );

          const assignments: TaskAssignment[] = [];
          if (matchedUnit) {
            assignments.push({
              assignedUnitId: matchedUnit.unitId,
              requiredRole: "SPECIALIST",
              requiredMinSecurity: 2,
              assignmentType: "MAIN",
              assignedUserId: 0, // Giá trị tạm thời để thỏa mãn type
              isAccepted: false,  // Giá trị tạm thời để thỏa mãn type
            } as TaskAssignment);
            loadMembers(matchedUnit.unitId);
          }

          return {
            id: s.id,
            name: s.name,
            deadline: undefined,
            parentId: null,
            isFixed: true,
            assignments: assignments
          };
        });
        
        setTasks(initialTasks);
      }).catch(() => toast({ variant: "destructive", description: "Lỗi tải danh sách phòng ban" }));

      setProjectName(defaultName || "");
    }
  }, [isOpen, defaultName, toast]);

  // --- ACTIONS ---
  const addSubTask = (parentId: string) => {
    const parentTask = tasks.find(t => t.id === parentId);
    const newTask: TempTask = { 
      id: `sub_${Date.now()}_${Math.random()}`, 
      name: "", 
      deadline: undefined, 
      parentId: parentId,
      isFixed: false,
      assignments: parentTask ? [...parentTask.assignments] : [],
      assigneeId: undefined
    };
    setTasks(prev => [...prev, newTask]);
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTask = (id: string, field: keyof TempTask, value: any) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const updateAssignment = (taskId: string, unitId: string) => {
    const uId = Number(unitId);
    loadMembers(uId);

    const newAssignment = {
      assignedUnitId: uId,
      requiredRole: "SPECIALIST", 
      requiredMinSecurity: 2,
      assignmentType: "MAIN",
      assignedUserId: 0,
      isAccepted: false
    } as TaskAssignment;

    setTasks(prev => {
      let newTasks = prev.map(t => {
        if (t.id === taskId) {
          return { ...t, assignments: [newAssignment], assigneeId: undefined };
        }
        return t;
      });

      const isParent = FIXED_SECTIONS.some(s => s.id === taskId);
      if (isParent) {
        newTasks = newTasks.map(t => {
          if (t.parentId === taskId) {
            return { ...t, assignments: [newAssignment], assigneeId: undefined };
          }
          return t;
        });
      }
      return newTasks;
    });
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!projectName.trim()) return toast({ variant: "destructive", description: "Vui lòng nhập tên dự án" });

    try {
      setIsSubmitting(true);

      const projectRes = await biddingProjectApi.create({
        name: projectName,
        status: "New",
        sourcePackageId: hsmtId,
      });
      const newProjectId = projectRes.id;

      const parentMap: Record<string, number> = {}; 
      const parentTasks = tasks.filter(t => t.isFixed);

      for (const p of parentTasks) {
        const res = await taskApi.create({
          taskName: p.name,
          biddingProjectId: newProjectId,
          deadline: p.deadline ? p.deadline.toISOString() : undefined,
          status: "OPEN",
          isMilestone: true, 
          sourceType: "SYSTEM", 
          parentTaskId: 0,
          assignments: p.assignments,
          assigneeId: p.assigneeId
        });
        parentMap[p.id] = res.id;
      }

      const subTasks = tasks.filter(t => !t.isFixed && t.name.trim() !== "");
      for (const s of subTasks) {
        const realParentId = s.parentId ? parentMap[s.parentId] : 0;
        if (!realParentId) continue; 

        await taskApi.create({
          taskName: s.name,
          biddingProjectId: newProjectId,
          deadline: s.deadline ? s.deadline.toISOString() : undefined,
          status: "OPEN",
          isMilestone: false,
          sourceType: "USER",
          parentTaskId: realParentId,
          assignments: s.assignments,
          assigneeId: s.assigneeId
        });
      }

      toast({ title: "Thành công", description: "Dự án đã được khởi tạo." });
      onClose();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error?.message || "Có lỗi xảy ra" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] max-h-[90vh] flex flex-col p-0 gap-0 bg-slate-50 overflow-hidden">
        
        <DialogHeader className="px-6 py-4 bg-white border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <LayoutList className="h-6 w-6 text-purple-600" />
            Xem trước Kế hoạch AI & Phân công
          </DialogTitle>
          <DialogDescription>
            Rà soát hạng mục và gán đích danh nhân sự thực hiện cho dự án.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tên dự án</label>
             <Input 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)} 
                className="text-lg font-bold border-none shadow-none p-0 focus-visible:ring-0 placeholder:text-slate-300 h-auto"
                placeholder="Nhập tên dự án..."
             />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             <div className="grid grid-cols-12 gap-4 bg-slate-100/80 p-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b">
                <div className="col-span-4 pl-4">Hạng mục công việc (WBS)</div>
                <div className="col-span-3">Phòng ban phụ trách</div>
                <div className="col-span-2">Người thực hiện</div>
                <div className="col-span-2">Deadline</div>
                <div className="col-span-1 text-center">#</div>
             </div>

             <div className="divide-y divide-slate-100">
                {FIXED_SECTIONS.map((section, index) => {
                    const parentTask = tasks.find(t => t.id === section.id);
                    const subTasks = tasks.filter(t => t.parentId === section.id);
                    const assignedUnitId = parentTask?.assignments[0]?.assignedUnitId;
                    const members = assignedUnitId ? (membersCache[assignedUnitId] || []) : [];
                    
                    return (
                      <React.Fragment key={section.id}>
                        {/* PARENT ROW */}
                        <div className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-slate-50 border-l-4 border-l-purple-600 bg-purple-50/10">
                           <div className="col-span-4 flex items-center gap-3 pl-2">
                              <span className="font-bold text-slate-800 text-sm">{index + 1}. {section.name}</span>
                           </div>
                           <div className="col-span-3">
                              <Select 
                                onValueChange={(val) => updateAssignment(section.id, val)} 
                                value={assignedUnitId ? String(assignedUnitId) : undefined}
                              >
                                <SelectTrigger className="h-8 text-xs border-none bg-transparent hover:bg-slate-100 px-2 shadow-none focus:ring-0">
                                  <SelectValue placeholder="Chọn phòng ban..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {units.map(u => <SelectItem key={u.unitId} value={String(u.unitId)} className="text-xs">{u.unitName}</SelectItem>)}
                                </SelectContent>
                              </Select>
                           </div>
                           <div className="col-span-2">
                              <Select 
                                onValueChange={(val) => updateTask(section.id, "assigneeId", Number(val))} 
                                value={parentTask?.assigneeId?.toString()}
                                disabled={!assignedUnitId}
                              >
                                <SelectTrigger className="h-8 text-xs border-none bg-transparent hover:bg-slate-100 shadow-none focus:ring-0">
                                  <SelectValue placeholder="Chủ trì..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {members.map(m => <SelectItem key={m.userId} value={m.userId.toString()} className="text-xs">{m.fullName}</SelectItem>)}
                                </SelectContent>
                              </Select>
                           </div>
                           <div className="col-span-2 text-xs text-slate-400 italic">--</div>
                           <div className="col-span-1 flex justify-center">
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-purple-600 rounded-full" onClick={() => addSubTask(section.id)}><Plus className="h-4 w-4" /></Button>
                           </div>
                        </div>

                        {/* SUB ROWS */}
                        {subTasks.map((sub, subIndex) => {
                           const subUnitId = sub.assignments[0]?.assignedUnitId;
                           const subMembers = subUnitId ? (membersCache[subUnitId] || []) : [];
                           return (
                             <div key={sub.id} className="grid grid-cols-12 gap-4 p-2 items-center hover:bg-slate-50 border-l-4 border-l-transparent">
                                <div className="col-span-4 flex items-center gap-2 pl-8">
                                   <span className="text-xs font-medium text-slate-400">{index + 1}.{subIndex + 1}</span>
                                   <Input 
                                      value={sub.name} 
                                      onChange={(e) => updateTask(sub.id, "name", e.target.value)}
                                      placeholder="Tên công việc..."
                                      className="h-8 text-sm border-transparent bg-transparent focus:bg-white px-2"
                                   />
                                </div>
                                <div className="col-span-3">
                                   <Select onValueChange={(val) => updateAssignment(sub.id, val)} value={subUnitId ? String(subUnitId) : undefined}>
                                      <SelectTrigger className="h-8 text-xs border-none bg-transparent hover:bg-slate-100 px-2 shadow-none focus:ring-0">
                                        <SelectValue placeholder="Chọn phòng..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {units.map(u => <SelectItem key={u.unitId} value={String(u.unitId)} className="text-xs">{u.unitName}</SelectItem>)}
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="col-span-2">
                                   <Select 
                                      onValueChange={(val) => updateTask(sub.id, "assigneeId", Number(val))} 
                                      value={sub.assigneeId?.toString()}
                                      disabled={!subUnitId}
                                   >
                                      <SelectTrigger className="h-8 text-xs border-none bg-slate-100/50 hover:bg-slate-100 shadow-none focus:ring-0">
                                        <SelectValue placeholder="Người làm..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {subMembers.map(m => <SelectItem key={m.userId} value={m.userId.toString()} className="text-xs">{m.fullName}</SelectItem>)}
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="col-span-2">
                                   <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className={cn("h-8 w-full justify-start text-xs px-2 hover:bg-slate-100", !sub.deadline && "text-slate-400")}>
                                          {sub.deadline ? format(sub.deadline, "dd/MM/yyyy") : "Hạn chót..."}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar mode="single" selected={sub.deadline} onSelect={(date) => updateTask(sub.id, "deadline", date)} initialFocus />
                                      </PopoverContent>
                                   </Popover>
                                </div>
                                <div className="col-span-1 flex justify-center">
                                   <Button variant="ghost" size="icon" onClick={() => removeTask(sub.id)} className="h-7 w-7 text-slate-300 hover:text-red-500 rounded-full"><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                             </div>
                           )
                        })}
                      </React.Fragment>
                    );
                })}
             </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-white border-t">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Hủy bỏ</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 min-w-[150px] font-bold text-white">
             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Áp dụng Kế hoạch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};