import { Task, TaskType, TaskPriority } from "@/entities/task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; // Giả sử bạn đã có component Tabs
// Import 3 tab con (sẽ tạo bên dưới)
import { GeneralTab } from "./tabs/general-tab";
import { WorkspaceTab } from "./tabs/workspace-tab";
import { DocumentsTab } from "./tabs/documents-tab";

interface TaskDetailPanelProps {
  task: Task | null;
}

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

  return (
    <div className="flex flex-col h-full">
      {/* 1. Header Area: Tên task & Meta info */}
      <div className="px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-2 mb-2">
           {/* Badge Status - Có thể tách thành component riêng sau */}
           <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-bold uppercase">
              {task.status}
           </span>
           {task.priority === TaskPriority.HIGH && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-bold uppercase">
                HIGH PRIORITY
              </span>
           )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {task.taskName}
        </h1>
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
              Tài liệu công việc
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 3. Tab Contents - Khu vực cuộn chính */}
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