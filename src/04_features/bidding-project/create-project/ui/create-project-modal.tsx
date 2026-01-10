"use client";

import React, { useState } from "react"; // [MỚI] Import useState
import { LayoutList, Loader2, AlertCircle } from "lucide-react"; // [MỚI] Thêm icon Alert
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { useToast } from "@/shared/lib/hooks/use-toast"; // [MỚI] Import Toast để thông báo
import { useCreateProject } from "../model/use-create-project";
import { TaskSectionRow } from "./task-section-row";
import { cn } from "@/shared/lib/utils"; // [MỚI]

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  hsmtId: number;
  defaultName: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = (props) => {
  const {
    projectName, setProjectName, isSubmitting, tasks,
    boards, departmentsCache, 
    handleBoardChange, handleDepartmentChange,
    addSubTask, removeTask, updateTask, handleSubmit,
  } = useCreateProject(props);

  const { toast } = useToast(); // [MỚI]
  const [showValidationErrors, setShowValidationErrors] = useState(false); // [MỚI] State kích hoạt hiển thị lỗi

  const parentTasks = tasks.filter(t => t.parentId === null);

  // [LOGIC MỚI] Hàm kiểm tra dữ liệu trước khi submit
  const handleValidateAndSubmit = () => {
    // 1. Kiểm tra tên dự án
    if (!projectName.trim()) {
        setShowValidationErrors(true);
        toast({
            variant: "destructive",
            title: "Thiếu thông tin",
            description: "Vui lòng nhập tên dự án.",
        });
        return;
    }

    // 2. Kiểm tra từng task
    for (const task of tasks) {
        // Bỏ qua task có file tự động (thường là đã ok)
        if (task.files && task.files.length > 0) continue;

        // Xác định xem task này có phải là Group cha (chỉ dùng để gom nhóm) hay không
        // Logic: Nếu là Cha VÀ có con -> Là Group -> Không cần validate Ban/Phòng/Deadline
        const isParent = task.parentId === null;
        const hasChildren = tasks.some(t => t.parentId === task.id);
        const isGroup = isParent && hasChildren;

        // Nếu là task cần thực hiện (Assignable)
        if (!isGroup) {
            // Check Tên
            if (!task.name.trim()) {
                setShowValidationErrors(true);
                toast({ variant: "destructive", title: "Thiếu dữ liệu", description: "Có công việc chưa nhập tên." });
                return;
            }
            // Check Ban
            if (!task.selectedBoardId) {
                setShowValidationErrors(true);
                toast({ variant: "destructive", title: "Thiếu dữ liệu", description: `Công việc "${task.name}" chưa chọn Ban.` });
                return;
            }
            // Check Phòng
            if (!task.assignments || !task.assignments[0]?.assignedUnitId) {
                setShowValidationErrors(true);
                toast({ variant: "destructive", title: "Thiếu dữ liệu", description: `Công việc "${task.name}" chưa chọn Phòng ban.` });
                return;
            }
            // Check Deadline
            if (!task.deadline) {
                setShowValidationErrors(true);
                toast({ variant: "destructive", title: "Thiếu dữ liệu", description: `Công việc "${task.name}" chưa chọn Hạn chót (Deadline).` });
                return;
            }
        }
    }

    // Nếu mọi thứ OK -> Gửi
    handleSubmit();
  };

  return (
    <Dialog open={props.isOpen} onOpenChange={(open) => {
        if(!open) setShowValidationErrors(false); // Reset lỗi khi đóng
        props.onClose();
    }}>
      <DialogContent className="max-w-[1200px] max-h-[90vh] flex flex-col p-0 gap-0 bg-slate-50 overflow-hidden">
        
        <DialogHeader className="px-6 py-4 bg-white border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <LayoutList className="h-6 w-6 text-purple-600" />
            Xem trước Kế hoạch AI & Phân công
          </DialogTitle>
          <DialogDescription>Rà soát hạng mục và gán phòng ban thực hiện.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tên dự án <span className="text-red-500">*</span></label>
                {showValidationErrors && !projectName.trim() && <span className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle size={12}/> Bắt buộc nhập</span>}
            </div>
            <Input 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)} 
                className={cn(
                    "text-lg font-bold border-none shadow-none p-0 focus-visible:ring-0 placeholder:text-slate-300 h-auto",
                    showValidationErrors && !projectName.trim() ? "border-b border-red-500 rounded-none" : ""
                )}
                placeholder="Nhập tên dự án..." 
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 bg-slate-100/80 p-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b">
              <div className="col-span-5 pl-4">Hạng mục công việc (WBS)</div>
              <div className="col-span-4">Phòng ban phụ trách <span className="text-red-500">*</span></div>
              <div className="col-span-2">Deadline <span className="text-red-500">*</span></div>
              <div className="col-span-1 text-center">#</div>
            </div>

            <div className="divide-y divide-slate-100">
              {parentTasks.map((parentTask, index) => {
                const subTasks = tasks.filter((t) => t.parentId === parentTask.id);
                return (
                  <TaskSectionRow
                    key={parentTask.id}
                    index={index}
                    sectionId={parentTask.id}
                    sectionName={parentTask.name}
                    parentTask={parentTask}
                    subTasks={subTasks}
                    
                    boards={boards}
                    departmentsCache={departmentsCache}
                    
                    onBoardChange={handleBoardChange}
                    onDepartmentChange={handleDepartmentChange}
                    onUpdateTask={updateTask}
                    onAddSubTask={addSubTask}
                    onRemoveTask={removeTask}
                    // [MỚI] Truyền trạng thái lỗi xuống để row tự highlight
                    showValidationErrors={showValidationErrors}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-white border-t">
          <Button variant="ghost" onClick={props.onClose} disabled={isSubmitting}>Hủy bỏ</Button>
          {/* [FIX] Gọi hàm validate thay vì handleSubmit trực tiếp */}
          <Button onClick={handleValidateAndSubmit} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 min-w-[150px] font-bold text-white">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Áp dụng Kế hoạch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};