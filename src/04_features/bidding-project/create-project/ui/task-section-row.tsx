import React from "react";
import { format } from "date-fns";
import { Plus, Trash2, FileText, CheckCircle2, ExternalLink } from "lucide-react"; // Thêm icon
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { OrganizationUnit, UnitMember } from "@/entities/organization";
import { TempTask } from "../model/create-project.model";

interface TaskSectionRowProps {
  index: number;
  sectionId: string;
  sectionName: string;
  parentTask?: TempTask;
  subTasks: TempTask[];
  
  boards: OrganizationUnit[];
  departmentsCache: Record<number, OrganizationUnit[]>;
  membersCache: Record<number, UnitMember[]>;

  onBoardChange: (taskId: string, boardId: string) => void;
  onDepartmentChange: (taskId: string, deptId: string) => void;
  onUpdateTask: (id: string, field: keyof TempTask, value: any) => void;
  onAddSubTask: (parentId: string) => void;
  onRemoveTask: (id: string) => void;
}

export const TaskSectionRow: React.FC<TaskSectionRowProps> = ({
  index,
  sectionId,
  sectionName,
  parentTask,
  subTasks,
  boards,
  departmentsCache,
  membersCache,
  onBoardChange,
  onDepartmentChange,
  onUpdateTask,
  onAddSubTask,
  onRemoveTask,
}) => {

  // --- HELPER: RENDER CONTENT HOẶC FILES ---
  // Hàm này quyết định hiển thị File hay là Form nhập liệu
  const renderRightSideContent = (task: TempTask | undefined, isParent: boolean) => {
    if (!task) return null;

    // CASE 1: CÓ FILE TỰ ĐỘNG -> HIỂN THỊ FILE, ẨN FORM
    if (task.files && task.files.length > 0) {
      return (
        <div className="col-span-8 flex items-center gap-2 overflow-x-auto py-1">
          <div className="flex items-center text-green-600 text-[11px] font-bold bg-green-50 px-2 py-1 rounded border border-green-200 shrink-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Đã lấy {task.files.length} file từ Drive
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {task.files.map((file) => (
              <a 
                key={file.id} 
                href={file.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-50 hover:text-purple-600 hover:border-purple-200 transition-colors text-[11px]"
                title={file.name}
              >
                <FileText className="w-3 h-3 text-red-500" /> {/* Giả sử PDF */}
                <span className="max-w-[150px] truncate">{file.name}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            ))}
          </div>
        </div>
      );
    }

    // CASE 2: KHÔNG CÓ FILE -> HIỂN THỊ FORM NHẬP LIỆU (Board -> Unit -> Member -> Deadline)
    
    // Prepare Data
    const selectedBoardId = task.selectedBoardId;
    const assignedUnitId = task.assignments[0]?.assignedUnitId;
    const availableDepartments = selectedBoardId ? (departmentsCache[selectedBoardId] || []) : [];
    const members = assignedUnitId ? (membersCache[assignedUnitId] || []) : [];

    return (
      <>
        {/* 1. Organization (Col-3) */}
        <div className="col-span-3 flex flex-col gap-1.5">
            {/* Chọn Ban */}
            <Select
              value={selectedBoardId ? String(selectedBoardId) : undefined}
              onValueChange={(val) => onBoardChange(task.id, val)}
            >
              <SelectTrigger className="h-7 text-[11px] border-slate-200 bg-white px-2 focus:ring-0">
                <SelectValue placeholder="Chọn Ban..." />
              </SelectTrigger>
              <SelectContent>
                {boards.map((b) => (
                  <SelectItem key={b.unitId} value={String(b.unitId)} className="text-xs">
                    {b.unitName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Chọn Phòng */}
            <Select
              value={assignedUnitId ? String(assignedUnitId) : undefined}
              onValueChange={(val) => onDepartmentChange(task.id, val)}
              disabled={!selectedBoardId}
            >
              <SelectTrigger className={cn(
                "h-7 text-[11px] border-none bg-slate-100/50 px-2 focus:ring-0 shadow-none",
                !selectedBoardId && "opacity-50 cursor-not-allowed"
              )}>
                <SelectValue placeholder={selectedBoardId ? "Chọn Phòng..." : "(--)"} />
              </SelectTrigger>
              <SelectContent>
                {availableDepartments.length > 0 ? (
                    availableDepartments.map((d) => (
                    <SelectItem key={d.unitId} value={String(d.unitId)} className="text-xs">
                        {d.unitName}
                    </SelectItem>
                    ))
                ) : (
                    <div className="p-2 text-[10px] text-slate-400 text-center">Không có phòng ban</div>
                )}
              </SelectContent>
            </Select>
        </div>

        {/* 2. Assignee (Col-2) */}
        <div className="col-span-2 pt-0.5">
          <Select
            onValueChange={(val) => onUpdateTask(task.id, "assigneeId", Number(val))}
            value={task.assigneeId?.toString()}
            disabled={!assignedUnitId}
          >
            <SelectTrigger className="h-8 text-xs border-none bg-transparent (isParent ? '' : 'bg-slate-100/50') hover:bg-slate-100 shadow-none focus:ring-0">
              <SelectValue placeholder={isParent ? "Chủ trì..." : "Người làm..."} />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId.toString()} className="text-xs">
                  {m.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Deadline (Col-2) */}
        <div className="col-span-2 pt-0.5">
          {isParent ? (
             <div className="text-xs text-slate-400 italic pt-2 pl-2">--</div>
          ) : (
            <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-full justify-start text-xs px-2 hover:bg-slate-100",
                      !task.deadline && "text-slate-400"
                    )}
                  >
                    {task.deadline ? format(task.deadline, "dd/MM/yyyy") : "Hạn chót..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={task.deadline}
                    onSelect={(date) => onUpdateTask(task.id, "deadline", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
          )}
        </div>

        {/* 4. Action (Col-1) */}
        <div className="col-span-1 flex justify-center pt-0.5">
          {isParent ? (
            <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-purple-600 rounded-full hover:bg-purple-100"
                onClick={() => onAddSubTask(task.id)}
            >
                <Plus className="h-4 w-4" />
            </Button>
          ) : (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveTask(task.id)}
                className="h-7 w-7 text-slate-300 hover:text-red-500 rounded-full"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {/* ================= PARENT ROW ================= */}
      <div className="grid grid-cols-12 gap-4 p-3 items-start hover:bg-slate-50 border-l-4 border-l-purple-600 bg-purple-50/10 transition-colors">
        {/* Name (Luôn hiển thị) */}
        <div className="col-span-4 flex items-center gap-3 pl-2 pt-1.5">
          <span className="font-bold text-slate-800 text-sm">
            {index + 1}. {sectionName}
          </span>
        </div>

        {/* Dynamic Content: Files OR Selectors */}
        {renderRightSideContent(parentTask, true)}
      </div>

      {/* ================= SUB ROWS ================= */}
      {subTasks.map((sub, subIndex) => {
        return (
          <div
            key={sub.id}
            className="grid grid-cols-12 gap-4 p-2 items-start hover:bg-slate-50 border-l-4 border-l-transparent transition-colors"
          >
            {/* Name */}
            <div className="col-span-4 flex items-center gap-2 pl-8 pt-1">
              <span className="text-xs font-medium text-slate-400 mt-1.5">
                {index + 1}.{subIndex + 1}
              </span>
              <Input
                value={sub.name}
                onChange={(e) => onUpdateTask(sub.id, "name", e.target.value)}
                placeholder="Tên công việc..."
                className="h-8 text-sm border-transparent bg-transparent focus:bg-white px-2 w-full"
              />
            </div>

             {/* Dynamic Content */}
             {renderRightSideContent(sub, false)}
          </div>
        );
      })}
    </>
  );
};