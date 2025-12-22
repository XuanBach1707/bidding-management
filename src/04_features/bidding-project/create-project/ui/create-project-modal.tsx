"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Plus, Trash2, Loader2, Calendar as CalendarIcon, 
  Building2, LayoutList
} from "lucide-react";

import { biddingProjectApi } from "@/entities/bidding-project";
import { taskApi, TaskAssignment } from "@/entities/task";
import { organizationApi, OrganizationUnit } from "@/entities/organization";

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
              requiredMinSecurity: "2",
              assignmentType: "MAIN"
            });
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
      assignments: parentTask ? [...parentTask.assignments] : [] 
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
    const unit = units.find(u => u.unitId === Number(unitId));
    if (!unit) return;

    const newAssignment: TaskAssignment = {
      assignedUnitId: unit.unitId,
      requiredRole: "SPECIALIST", 
      requiredMinSecurity: "2",
      assignmentType: "MAIN"
    };

    setTasks(prev => {
      let newTasks = prev.map(t => {
        if (t.id === taskId) {
          return { ...t, assignments: [newAssignment] };
        }
        return t;
      });

      const isParent = FIXED_SECTIONS.some(s => s.id === taskId);
      if (isParent) {
        newTasks = newTasks.map(t => {
          if (t.parentId === taskId) {
            return { ...t, assignments: [newAssignment] };
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

      await Promise.all(parentTasks.map(async (p) => {
        const res = await taskApi.create({
          taskName: p.name,
          biddingProjectId: newProjectId,
          deadline: p.deadline ? p.deadline.toISOString() : undefined,
          status: "OPEN",
          isMilestone: true, 
          sourceType: "SYSTEM", 
          parentTaskId: 0,
          assignments: p.assignments
        });
        parentMap[p.id] = res.id;
      }));

      const subTasks = tasks.filter(t => !t.isFixed && t.name.trim() !== "");
      
      await Promise.all(subTasks.map(async (s) => {
        const realParentId = s.parentId ? parentMap[s.parentId] : 0;
        if (!realParentId) return; 

        return taskApi.create({
          taskName: s.name,
          biddingProjectId: newProjectId,
          deadline: s.deadline ? s.deadline.toISOString() : undefined,
          status: "OPEN",
          isMilestone: false,
          sourceType: "USER",
          parentTaskId: realParentId,
          assignments: s.assignments
        });
      }));

      toast({ title: "Thành công", description: "Dự án đã được khởi tạo." });
      onClose();
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: error?.message || "Có lỗi xảy ra" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper render Unit Selector
  const UnitSelector = ({ currentAssignment, onChange, className }: { currentAssignment?: TaskAssignment, onChange: (val: string) => void, className?: string }) => {
    return (
      <Select onValueChange={onChange} value={currentAssignment ? String(currentAssignment.assignedUnitId) : undefined}>
        <SelectTrigger className={cn("h-8 text-xs bg-transparent border-none shadow-none focus:ring-0 px-2 hover:bg-slate-100", className)}>
          <div className="flex items-center gap-2 truncate">
            {currentAssignment ? (
               <span className="font-medium text-slate-700">
                  {units.find(u => u.unitId === currentAssignment.assignedUnitId)?.unitName}
               </span>
            ) : (
               <span className="text-slate-400 italic">Chọn phòng ban...</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {units.map(u => <SelectItem key={u.unitId} value={String(u.unitId)} className="text-xs">{u.unitName}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* [FIX] Thêm overflow-hidden để Footer không bị trôi */}
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 bg-slate-50 overflow-hidden">
        
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 bg-white border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <LayoutList className="h-6 w-6 text-purple-600" />
            Xem trước Kế hoạch AI
          </DialogTitle>
          <DialogDescription>
            Rà soát các hạng mục công việc và phân công trước khi khởi tạo dự án.
          </DialogDescription>
        </DialogHeader>

        {/* BODY - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tên Dự án */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tên dự án</label>
             <Input 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)} 
                className="text-lg font-bold border-none shadow-none p-0 focus-visible:ring-0 placeholder:text-slate-300 h-auto"
                placeholder="Nhập tên dự án..."
             />
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             
             {/* TABLE HEADER */}
             <div className="grid grid-cols-12 gap-4 bg-slate-100/80 p-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <div className="col-span-6 pl-4">Hạng mục công việc (WBS)</div>
                <div className="col-span-3">Phòng ban phụ trách</div>
                <div className="col-span-2">Deadline</div>
                <div className="col-span-1 text-center">#</div>
             </div>

             {/* TABLE BODY */}
             <div className="divide-y divide-slate-100">
                {FIXED_SECTIONS.map((section, index) => {
                   const parentTask = tasks.find(t => t.id === section.id);
                   const subTasks = tasks.filter(t => t.parentId === section.id);
                   const assignedUnit = parentTask?.assignments[0];
                   
                   return (
                      <div key={section.id} className="group">
                         
                         {/* PARENT ROW */}
                         <div className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-slate-50 transition-colors border-l-4 border-l-purple-600 bg-purple-50/10">
                            
                            {/* WBS Name */}
                            <div className="col-span-6 flex items-center gap-3 pl-2">
                               <span className="font-bold text-slate-800 text-sm">
                                  {index + 1}. {section.name}
                               </span>
                            </div>

                            {/* Unit */}
                            <div className="col-span-3">
                               <UnitSelector 
                                  currentAssignment={assignedUnit} 
                                  onChange={(val) => updateAssignment(section.id, val)}
                               />
                            </div>

                            {/* Deadline (Parent thường để trống) */}
                            <div className="col-span-2 text-xs text-slate-400 italic">
                               --
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex justify-center">
                               <Button 
                                  size="icon" variant="ghost" className="h-7 w-7 text-purple-600 hover:bg-purple-100 rounded-full"
                                  onClick={() => addSubTask(section.id)}
                                  title="Thêm việc con"
                               >
                                  <Plus className="h-4 w-4" />
                               </Button>
                            </div>
                         </div>

                         {/* CHILDREN ROWS */}
                         {subTasks.map((sub, subIndex) => (
                            <div key={sub.id} className="grid grid-cols-12 gap-4 p-2 items-center hover:bg-slate-50 transition-colors border-l-4 border-l-transparent">
                               
                               {/* WBS Name (Indented) */}
                               <div className="col-span-6 flex items-center gap-2 pl-8">
                                  <span className="text-xs font-medium text-slate-400 select-none">
                                     {index + 1}.{subIndex + 1}
                                  </span>
                                  <Input 
                                     value={sub.name} 
                                     onChange={(e) => updateTask(sub.id, "name", e.target.value)}
                                     placeholder="Nhập tên công việc..."
                                     className="h-8 text-sm border-transparent bg-transparent focus:bg-white focus:border-slate-200 focus:shadow-sm px-2 rounded-md font-medium text-slate-700 placeholder:text-slate-300"
                                  />
                               </div>

                               {/* Unit (Inherited) */}
                               <div className="col-span-3">
                                  <UnitSelector 
                                     currentAssignment={sub.assignments[0]} 
                                     onChange={(val) => updateAssignment(sub.id, val)}
                                  />
                               </div>

                               {/* Deadline */}
                               <div className="col-span-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="sm" className={cn("h-8 w-full justify-start text-xs font-normal px-2 hover:bg-slate-100", !sub.deadline && "text-slate-400")}>
                                        <span className="truncate">
                                          {sub.deadline ? format(sub.deadline, "dd/MM/yyyy") : "Chọn ngày..."}
                                        </span>
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                      <Calendar mode="single" selected={sub.deadline} onSelect={(date) => updateTask(sub.id, "deadline", date)} initialFocus />
                                    </PopoverContent>
                                  </Popover>
                               </div>

                               {/* Actions */}
                               <div className="col-span-1 flex justify-center">
                                  <Button variant="ghost" size="icon" onClick={() => removeTask(sub.id)} className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full">
                                     <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                               </div>
                            </div>
                         ))}
                      </div>
                   );
                })}
             </div>
          </div>
        </div>

        {/* FOOTER - [FIX] Removed sticky, now sits naturally at the bottom */}
        <DialogFooter className="px-6 py-4 bg-white border-t">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Hủy bỏ</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 min-w-[150px] font-bold">
             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Áp dụng Kế hoạch"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};