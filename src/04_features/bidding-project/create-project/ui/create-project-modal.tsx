"use client";

import React from "react";
import { LayoutList, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { FIXED_SECTIONS } from "../model/create-project.model";
import { useCreateProject } from "../model/use-create-project";
import { TaskSectionRow } from "./task-section-row";

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

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
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
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tên dự án</label>
            <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="text-lg font-bold border-none shadow-none p-0 focus-visible:ring-0 placeholder:text-slate-300 h-auto" placeholder="Nhập tên dự án..." />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* [UPDATED] Header Grid khớp với Row */}
            <div className="grid grid-cols-12 gap-4 bg-slate-100/80 p-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b">
              <div className="col-span-5 pl-4">Hạng mục công việc (WBS)</div>
              <div className="col-span-4">Phòng ban phụ trách</div>
              {/* <div className="col-span-2">Người thực hiện</div> -> ĐÃ BỎ */}
              <div className="col-span-2">Deadline</div>
              <div className="col-span-1 text-center">#</div>
            </div>

            <div className="divide-y divide-slate-100">
              {FIXED_SECTIONS.map((section, index) => {
                const parentTask = tasks.find((t) => t.id === section.id);
                const subTasks = tasks.filter((t) => t.parentId === section.id);

                return (
                  <TaskSectionRow
                    key={section.id}
                    index={index}
                    sectionId={section.id}
                    sectionName={section.name}
                    parentTask={parentTask}
                    subTasks={subTasks}
                    
                    boards={boards}
                    departmentsCache={departmentsCache}
                    // membersCache={membersCache} // [REMOVED]
                    
                    onBoardChange={handleBoardChange}
                    onDepartmentChange={handleDepartmentChange}
                    onUpdateTask={updateTask}
                    onAddSubTask={addSubTask}
                    onRemoveTask={removeTask}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-white border-t">
          <Button variant="ghost" onClick={props.onClose} disabled={isSubmitting}>Hủy bỏ</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 min-w-[150px] font-bold text-white">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Áp dụng Kế hoạch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};