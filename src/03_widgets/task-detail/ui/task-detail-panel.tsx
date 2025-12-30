import { Task, TaskPriority } from "@/entities/task";
import { FolderOpen, Flag } from "lucide-react"; // Thêm icon Flag cho Priority
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; 
import { GeneralTab } from "./tabs/general-tab";
import { WorkspaceTab } from "./tabs/workspace-tab";
import { DocumentsTab } from "./tabs/documents-tab";
import { cn } from "@/shared/lib/utils"; // Import hàm cn để ghép class

interface TaskDetailPanelProps {
  task: Task | null;
}

// Helper: Cấu hình hiển thị cho Priority
const getPriorityConfig = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH:
      return { 
        label: "Ưu tiên Cao", 
        style: "bg-red-50 text-red-700 border-red-200",
        iconColor: "text-red-600"
      };
    case TaskPriority.MEDIUM:
      return { 
        label: "Ưu tiên Trung Bình", 
        style: "bg-blue-50 text-blue-700 border-blue-200",
        iconColor: "text-blue-600"
      };
    case TaskPriority.LOW:
      return { 
        label: "Ưu tiên Thấp", 
        style: "bg-slate-100 text-slate-600 border-slate-200",
        iconColor: "text-slate-500"
      };
    default:
      return { 
        label: priority, 
        style: "bg-gray-100 text-gray-700 border-gray-200",
        iconColor: "text-gray-500"
      };
  }
};

export const TaskDetailPanel = ({ task }: TaskDetailPanelProps) => {
  if (!task) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400 bg-white">
        <div className="text-center">
          <p className="text-lg font-medium">Chưa chọn nhiệm vụ nào</p>
          <p className="text-sm">Vui lòng chọn một công việc từ danh sách bên trái.</p>
        </div>
      </div>
    );
  }

  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <div className="flex flex-col h-full">
      {/* 1. Header Area */}
      <div className="px-6 py-5 border-b bg-white shadow-sm z-10">
        
        <div className="flex justify-between items-start gap-4">
          
          {/* CỘT TRÁI: Project Info & Task Name */}
          <div className="flex-1">
            <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
               <FolderOpen className="w-4 h-4 mr-2 text-blue-500" />
               <span className="uppercase tracking-wide text-blue-600 font-semibold text-xs">
                 {task.projectName || "Dự án không xác định"}
               </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {task.taskName}
            </h1>
          </div>

          {/* CỘT PHẢI: Status & Priority */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Badge Status */}
            <span className={cn(
                "text-xs px-3 py-1 rounded font-bold uppercase border",
                task.status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200" :
                task.status === "IN_PROGRESS" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                "bg-gray-100 text-gray-700 border-gray-200"
            )}>
              {task.status.replace("_", " ")}
            </span>
            
            {/* Badge Priority (MỚI THÊM) */}
            <div className={cn(
              "flex items-center text-xs px-3 py-1 rounded font-bold uppercase border",
              priorityConfig.style
            )}>
              <Flag className={cn("w-3 h-3 mr-1.5 fill-current", priorityConfig.iconColor)} />
              {priorityConfig.label}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tabs Navigation */}
      <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
        <div className="px-6 border-b bg-white">
          <TabsList className="w-full justify-start h-12 bg-transparent p-0">
            <TabsTrigger 
              value="general"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-none px-4 h-full"
            >
              Thông tin chung
            </TabsTrigger>
            
            <TabsTrigger 
              value="workspace"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-none px-4 h-full"
            >
              Workspace
            </TabsTrigger>
            
            <TabsTrigger 
              value="documents"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-none px-4 h-full"
            >
              Tài liệu
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 3. Tab Contents */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <TabsContent value="general" className="mt-0 h-full">
            <GeneralTab task={task} />
          </TabsContent>
          
          <TabsContent value="workspace" className="mt-0 h-full">
            <WorkspaceTab task={task} />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0 h-full">
            <DocumentsTab task={task} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};