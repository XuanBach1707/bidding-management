import React from "react";
import { format } from "date-fns";
import { Trash2, FileText, CheckCircle2, Calendar as CalendarIcon } from "lucide-react"; 
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { OrganizationUnit } from "@/entities/organization";
import { TempTask } from "../model/create-project.model";

interface TaskSectionRowProps {
  index: number;
  sectionId: string;
  sectionName: string;
  parentTask?: TempTask;
  subTasks: TempTask[];
  
  boards: OrganizationUnit[];
  departmentsCache: Record<number, OrganizationUnit[]>;

  onBoardChange: (taskId: string, boardId: string) => void;
  onDepartmentChange: (taskId: string, deptId: string) => void;
  onUpdateTask: (id: string, field: keyof TempTask, value: any) => void;
  onAddSubTask: (parentId: string) => void;
  onRemoveTask: (id: string) => void;
}

export const TaskSectionRow: React.FC<TaskSectionRowProps> = ({
  index, sectionId, sectionName, parentTask, subTasks,
  boards, departmentsCache,
  onBoardChange, onDepartmentChange, onUpdateTask, onAddSubTask, onRemoveTask,
}) => {

  const renderRightSideContent = (task: TempTask | undefined, isParent: boolean) => {
    if (!task) return null;

    // --- CASE 1: CÓ FILE TỰ ĐỘNG (HSPL, BCTC...) ---
    // Sẽ hiển thị file thay vì form nhập liệu
    if (task.files && task.files.length > 0) {
      return (
        <div className="col-span-7 flex items-center gap-2 overflow-x-auto py-1">
          <div className="flex items-center text-green-600 text-[11px] font-bold bg-green-50 px-2 py-1 rounded border border-green-200 shrink-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Đã lấy {task.files.length} file
          </div>
          <div className="flex gap-2 flex-wrap">
            {task.files.map((file) => (
              <a key={file.id} href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded text-[11px] hover:border-purple-300 transition-colors">
                <FileText className="w-3 h-3 text-red-500" />
                <span className="max-w-[100px] truncate">{file.name}</span>
              </a>
            ))}
          </div>
        </div>
      );
    }

    // --- CASE 2: FORM NHẬP LIỆU ---
    const selectedBoardId = task.selectedBoardId;
    const assignedUnitId = task.assignments[0]?.assignedUnitId;
    const availableDepartments = selectedBoardId ? (departmentsCache[selectedBoardId] || []) : [];

    // Logic Group: Task cha có subtask con đi kèm
    const isGroup = isParent && subTasks.length > 0;
    const isAssignable = !isGroup;

    return (
      <>
        {/* 1. Organization (Col-4) */}
        <div className="col-span-4 flex flex-col gap-1.5">
            {isAssignable ? (
                <>
                    <Select value={selectedBoardId ? String(selectedBoardId) : undefined} onValueChange={(val) => onBoardChange(task.id, val)}>
                    <SelectTrigger className="h-7 text-[11px] border-slate-200 bg-white px-2 focus:ring-0">
                        <SelectValue placeholder="Chọn Ban..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                        {boards.map((b) => (
                        <SelectItem key={b.unitId} value={String(b.unitId)} className="text-xs">{b.unitName}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>

                    <Select value={assignedUnitId ? String(assignedUnitId) : undefined} onValueChange={(val) => onDepartmentChange(task.id, val)} disabled={!selectedBoardId}>
                    <SelectTrigger className={cn("h-7 text-[11px] border-none bg-slate-100/50 px-2 focus:ring-0 shadow-none", !selectedBoardId && "opacity-50")}>
                        <SelectValue placeholder={selectedBoardId ? "Chọn Phòng..." : "(--)"} />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                        {availableDepartments.length > 0 ? (
                            availableDepartments.map((d) => <SelectItem key={d.unitId} value={String(d.unitId)} className="text-xs">{d.unitName}</SelectItem>)
                        ) : (<div className="p-2 text-[10px] text-slate-400 text-center">Không có phòng ban</div>)}
                    </SelectContent>
                    </Select>
                </>
            ) : (
                <div className="h-full flex items-center pl-2 bg-slate-50 rounded border border-dashed border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Nhóm công việc</span>
                </div>
            )}
        </div>

        {/* 2. Deadline (Col-2) */}
        <div className="col-span-2 pt-0.5">
            {/* [SỬA ĐỔI] Nếu là Group thì KHÔNG hiển thị Deadline */}
            {!isGroup ? (
                <Popover>
                    <PopoverTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                            "h-8 w-full justify-start text-xs px-2 hover:bg-slate-100", 
                            "border border-slate-200 bg-white", 
                            !task.deadline && "text-slate-400"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-500" />
                        {task.deadline ? format(task.deadline, "dd/MM/yyyy") : "Hạn chót..."}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]" align="end">
                    <Calendar 
                        mode="single" 
                        selected={task.deadline} 
                        onSelect={(date) => onUpdateTask(task.id, "deadline", date)} 
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus 
                    />
                    </PopoverContent>
                </Popover>
            ) : (
                // Placeholder cho Group
                <div className="h-8 w-full flex items-center justify-center">
                   <span className="text-[10px] text-slate-300">--</span>
                </div>
            )}
        </div>

        {/* 3. Action (Col-1) */}
        <div className="col-span-1 flex justify-center pt-0.5">
          {isParent ? (
            <div className="h-7 w-7" />
          ) : (
            <Button variant="ghost" size="icon" onClick={() => onRemoveTask(task.id)} className="h-7 w-7 text-slate-300 hover:text-red-500 rounded-full">
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {/* PARENT ROW */}
      <div className="grid grid-cols-12 gap-4 p-3 items-start hover:bg-slate-50 border-l-4 border-l-purple-600 bg-purple-50/10 transition-colors">
        <div className="col-span-5 flex items-center gap-3 pl-2 pt-1.5">
          <span className="font-bold text-slate-800 text-sm">{index + 1}. {sectionName}</span>
        </div>
        {renderRightSideContent(parentTask, true)}
      </div>

      {/* SUB ROWS */}
      {subTasks.map((sub, subIndex) => (
        <div key={sub.id} className="grid grid-cols-12 gap-4 p-2 items-start hover:bg-slate-50 border-l-4 border-l-transparent transition-colors">
          <div className="col-span-5 flex items-center gap-2 pl-8 pt-1">
            <span className="text-xs font-medium text-slate-400 mt-1.5">{index + 1}.{subIndex + 1}</span>
            <Input value={sub.name} onChange={(e) => onUpdateTask(sub.id, "name", e.target.value)} placeholder="Tên công việc..." className="h-8 text-sm border-transparent bg-transparent focus:bg-white px-2 w-full" />
          </div>
          {renderRightSideContent(sub, false)}
        </div>
      ))}
    </>
  );
};