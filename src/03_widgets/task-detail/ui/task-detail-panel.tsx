import { Task } from "@/entities/task";
import { FolderOpen } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; 
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
    <Tabs defaultValue="general" className="flex flex-col h-full bg-gray-50/50">
      
      {/* --- HEADER: Chỉ chứa Project Context & Tabs Navigation --- */}
      <div className="bg-white border-b shrink-0">
        
        {/* 1. Project Breadcrumb */}
        <div className="h-12 flex items-center px-6 border-b border-gray-100">
             <div className="flex items-center text-xs font-medium text-gray-500 hover:text-blue-600 cursor-pointer transition-colors">
                 <FolderOpen className="w-4 h-4 mr-2 text-blue-500" />
                 <span className="uppercase tracking-wide font-bold">
                   {task.projectName || "Dự án Global"}
                 </span>
                 <span className="mx-2 text-gray-300">/</span>
                 <span className="text-gray-400 font-normal">Task ID: #{task.id}</span>
              </div>
        </div>

        {/* 2. Tabs List */}
        <div className="px-6">
          <TabsList className="w-full justify-start h-11 bg-transparent p-0">
            <TabsTrigger 
              value="general"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-1 mr-8 h-full text-sm font-medium text-gray-500 hover:text-gray-800 shadow-none bg-transparent"
            >
              Thông tin chung
            </TabsTrigger>
            
            <TabsTrigger 
              value="workspace"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-1 mr-8 h-full text-sm font-medium text-gray-500 hover:text-gray-800 shadow-none bg-transparent"
            >
              Workspace
            </TabsTrigger>
            
            <TabsTrigger 
              value="documents"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-1 mr-8 h-full text-sm font-medium text-gray-500 hover:text-gray-800 shadow-none bg-transparent"
            >
              Tài liệu
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* --- CONTENT BODY --- */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <TabsContent value="general" className="h-full overflow-y-auto p-6 m-0 focus-visible:outline-none">
          <GeneralTab task={task} />
        </TabsContent>
        
        <TabsContent value="workspace" className="h-full overflow-y-auto p-6 m-0 focus-visible:outline-none">
          <WorkspaceTab task={task} />
        </TabsContent>
        
        <TabsContent value="documents" className="h-full overflow-y-auto p-6 m-0 focus-visible:outline-none">
          <DocumentsTab task={task} />
        </TabsContent>
      </div>

    </Tabs>
  );
};