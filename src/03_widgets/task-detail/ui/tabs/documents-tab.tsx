import { FolderOpen } from "lucide-react";
import { Task } from "@/entities/task";
import { TaskDocumentList } from "@/features/drive/task-document-list";
import { Badge } from "@/shared/ui/badge";

interface DocumentsTabProps {
  task: Task;
}

export const DocumentsTab = ({ task }: DocumentsTabProps) => {
  return (
    <div className="h-full animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-[#009d98]/10 rounded-lg">
                <FolderOpen className="w-5 h-5 text-[#009d98]" />
             </div>
             <h2 className="text-lg font-extrabold text-slate-900">Tài liệu công việc</h2>
          </div>
          
          <div className="text-sm text-slate-500 ml-[44px] flex items-center flex-wrap gap-1">
             Danh sách các tài liệu thuộc hồ sơ 
             <Badge variant="outline" className="font-mono text-xs font-bold bg-slate-50 border-slate-200 text-slate-700 px-2">
                {task.tag || "N/A"}
             </Badge>
             của dự án này.
          </div>
        </div>

        {/* Feature List Tài Liệu */}
        {/* Padding left để thẳng hàng với text ở trên */}
        <div className="md:pl-[44px]">
           <TaskDocumentList task={task} />
        </div>
        
      </div>
    </div>
  );
};