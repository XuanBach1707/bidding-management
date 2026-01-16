import { Task } from "@/entities/task";
import { FolderOpen, Layout, Briefcase, FileStack } from "lucide-react"; // Thêm icon cho Tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; 
import { GeneralTab } from "./tabs/general-tab";
import { WorkspaceTab } from "./tabs/workspace-tab";
import { DocumentsTab } from "./tabs/documents-tab";
import { cn } from "@/shared/lib/utils";

interface TaskDetailPanelProps {
  task: Task | null;
  onRefresh: () => void;
  // [MỚI] Thêm prop này để nhận biết đang ở chế độ duyệt hay chế độ làm việc
  isReviewMode?: boolean; 
}

export const TaskDetailPanel = ({ 
  task, 
  onRefresh, 
  isReviewMode = false // Mặc định là false (chế độ nhân viên)
}: TaskDetailPanelProps) => {

  if (!task) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-slate-400 bg-white">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Layout className="w-10 h-10 text-slate-300" />
        </div>
        <div className="text-center">
          {/* [UI Tinh chỉnh] Thay đổi câu thông báo tùy ngữ cảnh */}
          <p className="text-lg font-bold text-slate-700">
              {isReviewMode ? "Chưa chọn hồ sơ duyệt" : "Chưa chọn nhiệm vụ"}
          </p>
          <p className="text-sm text-slate-500 mt-1">Vui lòng chọn một mục từ danh sách bên trái để bắt đầu.</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="general" className="flex flex-col h-full bg-slate-50/50">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20">
        
        {/* 1. Project Breadcrumb */}
        <div className="h-12 flex items-center px-6 border-b border-slate-100 bg-slate-50/30">
             <div className="flex items-center text-xs font-medium text-slate-500 hover:text-[#009d98] cursor-pointer transition-colors group">
                 <FolderOpen className="w-4 h-4 mr-2 text-slate-400 group-hover:text-[#009d98]" />
                 <span className="uppercase tracking-wide font-bold">
                   {task.projectName || "Dự án Global"}
                 </span>
                 <span className="mx-2 text-slate-300">/</span>
                
             </div>
        </div>

        {/* 2. Tabs List & Task Title Preview */}
        <div className="px-6 pt-4 pb-0">
          <div className="mb-4">
             <h1 className="text-xl font-extrabold text-slate-900 line-clamp-1" title={task.taskName}>
                {task.taskName}
             </h1>
          </div>

          <TabsList className="w-full justify-start h-10 bg-transparent p-0 border-b border-transparent gap-6">
            <TabsTrigger 
              value="general"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#009d98] data-[state=active]:text-[#009d98] rounded-none px-0 pb-2 h-full text-sm font-bold text-slate-500 hover:text-slate-800 shadow-none bg-transparent transition-all gap-2"
            >
              <Layout className="w-4 h-4" />
              Thông tin chung
            </TabsTrigger>
            
            <TabsTrigger 
              value="workspace"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#009d98] data-[state=active]:text-[#009d98] rounded-none px-0 pb-2 h-full text-sm font-bold text-slate-500 hover:text-slate-800 shadow-none bg-transparent transition-all gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Không gian làm việc
            </TabsTrigger>
            
            <TabsTrigger 
              value="documents"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#009d98] data-[state=active]:text-[#009d98] rounded-none px-0 pb-2 h-full text-sm font-bold text-slate-500 hover:text-slate-800 shadow-none bg-transparent transition-all gap-2"
            >
              <FileStack className="w-4 h-4" />
              Tài liệu đính kèm
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* --- CONTENT BODY --- */}
      <div className="flex-1 overflow-hidden bg-slate-50/50 relative">
        
        <TabsContent value="general" className="h-full overflow-y-auto p-6 m-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-1 duration-200">
          {/* [QUAN TRỌNG] Truyền isReviewMode xuống GeneralTab */}
          {/* Để kích hoạt nút Duyệt/Từ chối thay vì Gửi duyệt */}
          <GeneralTab 
            task={task} 
            onRefresh={onRefresh} 
            isReviewMode={isReviewMode} 
          />
        </TabsContent>
        
        <TabsContent 
          value="workspace" 
          // [SỬA LẠI] Xóa 'p-6' và 'overflow-y-auto' đi. 
          // Chúng ta muốn Editor tự quản lý scroll bên trong nó.
          className="h-full m-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-1 duration-200 flex flex-col"
        >
          <WorkspaceTab 
            task={task} 
            isReviewMode={isReviewMode} 
          />
        </TabsContent>
        
        <TabsContent value="documents" className="h-full overflow-y-auto p-6 m-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-1 duration-200">
          {/* DocumentsTab thường là view file nên có thể chưa cần isReviewMode, 
              trừ khi bạn muốn chặn nút "Upload/Xóa file" trong đó. 
              Tạm thời ta giữ nguyên. */}
          <DocumentsTab task={task} />
        </TabsContent>
      </div>

    </Tabs>
  );
};