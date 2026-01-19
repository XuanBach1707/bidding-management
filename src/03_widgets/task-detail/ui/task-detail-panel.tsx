import { Task } from "@/entities/task";
import { FolderOpen, Layout, Briefcase, FileStack, ArrowLeft } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; 
import { Button } from "@/shared/ui/button"; // Cần import Button
import { GeneralTab } from "./tabs/general-tab";
import { WorkspaceTab } from "./tabs/workspace-tab";
import { DocumentsTab } from "./tabs/documents-tab";
import { cn } from "@/shared/lib/utils";

interface TaskDetailPanelProps {
  task: Task | null;
  onRefresh: () => void;
  isReviewMode?: boolean;
  /** [MỚI] Hàm quay lại danh sách (dành cho Mobile) */
  onBack?: () => void; 
}

export const TaskDetailPanel = ({ 
  task, 
  onRefresh, 
  isReviewMode = false,
  onBack
}: TaskDetailPanelProps) => {

  if (!task) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-slate-400 bg-white">
        {/* Mobile: Thêm nút quay lại nếu lỡ lạc vào màn hình trống */}
        <div className="md:hidden absolute top-4 left-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-5 h-5 mr-1"/> Quay lại
            </Button>
        </div>

        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Layout className="w-10 h-10 text-slate-300" />
        </div>
        <div className="text-center px-4">
          <p className="text-lg font-bold text-slate-700">
              {isReviewMode ? "Chưa chọn hồ sơ duyệt" : "Chưa chọn nhiệm vụ"}
          </p>
          <p className="text-sm text-slate-500 mt-1">Vui lòng chọn một mục từ danh sách bên trái.</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="general" className="flex flex-col h-full bg-slate-50/50">
      
      {/* --- HEADER (Sticky) --- */}
      <div className="bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20 shadow-sm">
        
        {/* 1. TOP BAR: Breadcrumb & Back Button */}
        {/* Mobile: h-auto py-2. PC: h-12. */}
        <div className="min-h-[48px] flex items-center px-4 md:px-6 border-b border-slate-100 bg-slate-50/30 gap-2">
             
             {/* [MỚI] Nút Back cho Mobile */}
             <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden -ml-2 h-8 w-8 text-slate-500" 
                onClick={onBack}
             >
                <ArrowLeft className="w-5 h-5" />
             </Button>

             {/* Breadcrumb Info */}
             <div className="flex items-center text-xs font-medium text-slate-500 hover:text-[#009d98] cursor-pointer transition-colors group overflow-hidden">
                 <FolderOpen className="w-4 h-4 mr-2 text-slate-400 group-hover:text-[#009d98] shrink-0" />
                 <span className="uppercase tracking-wide font-bold truncate">
                   {task.projectName || "Dự án Global"}
                 </span>
             </div>
        </div>

        {/* 2. TASK TITLE & TABS */}
        <div className="px-4 md:px-6 pt-4 pb-0">
          <div className="mb-4">
             {/* Title: Giảm size chữ trên mobile (text-lg) vs PC (text-xl) */}
             <h1 className="text-lg md:text-xl font-extrabold text-slate-900 line-clamp-2 leading-snug" title={task.taskName}>
                {task.taskName}
             </h1>
          </div>

          {/* Tabs List: Thêm overflow-x-auto để scroll ngang trên màn hình bé */}
          <div className="w-full overflow-x-auto no-scrollbar">
            <TabsList className="w-auto inline-flex justify-start h-10 bg-transparent p-0 border-b border-transparent gap-6 min-w-full md:min-w-0">
                <TabsTrigger 
                value="general"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#009d98] data-[state=active]:text-[#009d98] rounded-none px-0 pb-2 h-full text-sm font-bold text-slate-500 hover:text-slate-800 shadow-none bg-transparent transition-all gap-2 whitespace-nowrap"
                >
                <Layout className="w-4 h-4" />
                Thông tin chung
                </TabsTrigger>
                
                <TabsTrigger 
                value="workspace"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#009d98] data-[state=active]:text-[#009d98] rounded-none px-0 pb-2 h-full text-sm font-bold text-slate-500 hover:text-slate-800 shadow-none bg-transparent transition-all gap-2 whitespace-nowrap"
                >
                <Briefcase className="w-4 h-4" />
                Không gian làm việc
                </TabsTrigger>
                
                <TabsTrigger 
                value="documents"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#009d98] data-[state=active]:text-[#009d98] rounded-none px-0 pb-2 h-full text-sm font-bold text-slate-500 hover:text-slate-800 shadow-none bg-transparent transition-all gap-2 whitespace-nowrap"
                >
                <FileStack className="w-4 h-4" />
                Tài liệu
                </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>

      {/* --- CONTENT BODY --- */}
      <div className="flex-1 overflow-hidden bg-slate-50/50 relative">
        
        <TabsContent value="general" className="h-full overflow-y-auto p-4 md:p-6 m-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-1 duration-200">
          <GeneralTab 
            task={task} 
            onRefresh={onRefresh} 
            isReviewMode={isReviewMode} 
          />
        </TabsContent>
        
        <TabsContent 
          value="workspace" 
          // Tab này thường chứa Editor full màn hình nên không cần padding
          className="h-full m-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-1 duration-200 flex flex-col"
        >
          <WorkspaceTab 
            task={task} 
            isReviewMode={isReviewMode} 
          />
        </TabsContent>
        
        <TabsContent value="documents" className="h-full overflow-y-auto p-4 md:p-6 m-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-1 duration-200">
          <DocumentsTab task={task} />
        </TabsContent>
      </div>

    </Tabs>
  );
};