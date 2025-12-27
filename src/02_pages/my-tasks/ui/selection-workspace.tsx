"use client";

import { useEffect, useState } from "react";
import { Task } from "@/entities/task";
import { driveApi, DriveItem } from "@/shared/api/drive-api";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { 
  CheckCircle, FileText, Folder, Loader2, 
  ChevronRight, Home, Eye, Briefcase, Lock, Layers 
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useToast } from "@/shared/lib/hooks/use-toast";

const DEFAULT_ROOT_ID = "1GCCzpZ1eSDKWnKjz49pxLYt2GF5mBiho"; 

interface SelectionWorkspaceProps {
  task: Task;
}

export const SelectionWorkspace = ({ task }: SelectionWorkspaceProps) => {
  const { toast } = useToast();
  
  // --- STATE ---
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<DriveItem[]>([]);

  // --- [FIX] LOGIC LẤY DỮ LIỆU AN TOÀN ---
  // Ưu tiên snake_case từ BE nếu camelCase không có
  const displayProjectName = task.project_name || task.projectName || "Dự án (Chưa cập nhật tên)";
  const displayTaskName = task.task_name || task.taskName || "Nhiệm vụ không tên";
  
  // Lấy Project ID an toàn (Hỗ trợ cả 3 trường hợp)
  // 1. projectId (Alias)
  // 2. biddingProjectId (Frontend Convention)
  // 3. bidding_project_id (Backend Raw Data)
  const projectId = task.projectId || task.biddingProjectId || task.bidding_project_id || 19; 

  // 1. Initial Load
  useEffect(() => {
    const initWorkspace = async () => {
      setLoading(true);
      try {
        const rootId = task.rootFolderId || DEFAULT_ROOT_ID;

        console.log(`[Workspace] Context: ProjectID=${projectId}, RootID=${rootId}`);

        // Gọi API /me với Project ID đã xử lý
        const res = await driveApi.getMyContextFolder(rootId, projectId);
        
        setItems(res.data);
        setCurrentFolderId(res.current_folder_id);
        
        setBreadcrumbs([
            { id: rootId, name: "Kho dự án" },
            ...(res.current_folder_id !== rootId ? [{ id: res.current_folder_id, name: "Tài liệu phù hợp" }] : [])
        ]);

      } catch (error) {
        console.error("Lỗi tải workspace:", error);
        toast({ title: "Lỗi", description: "Không thể tải kho tài liệu.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    if (task) initWorkspace();
  }, [task.id, projectId]); // Theo dõi projectId thay đổi

  // 2. Navigation
  const handleNavigate = async (folder: DriveItem) => {
      if (folder.access === 'DENIED') {
          toast({ title: "Truy cập bị từ chối", description: "Bạn không có quyền xem folder này.", variant: "destructive" });
          return;
      }

      setLoading(true);
      try {
          const res = await driveApi.getFolderContent(folder.id);
          setItems(res.data);
          setCurrentFolderId(folder.id);
          
          setBreadcrumbs(prev => {
              const existingIdx = prev.findIndex(b => b.id === folder.id);
              if (existingIdx >= 0) return prev.slice(0, existingIdx + 1);
              return [...prev, { id: folder.id, name: folder.name }];
          });
      } catch (e) {
         toast({ title: "Lỗi", description: "Không thể mở thư mục.", variant: "destructive" });
      } finally {
          setLoading(false);
      }
  }

  // 3. Handle Breadcrumb
  const handleBreadcrumbClick = (crumb: {id: string, name: string}, index: number) => {
      setBreadcrumbs(prev => prev.slice(0, index + 1));
      handleNavigate({ id: crumb.id, name: crumb.name, type: 'FOLDER', link: '' }); 
  };
  
  // 4. Select File
  const toggleFile = (file: DriveItem) => {
    setSelectedFiles(prev => {
      const exists = prev.find(f => f.id === file.id);
      if (exists) return prev.filter(f => f.id !== file.id);
      return [...prev, file];
    });
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      toast({ title: "Chưa chọn tài liệu", description: "Vui lòng chọn ít nhất 1 file.", variant: "destructive" });
      return;
    }
    toast({ title: "Thành công", description: `Đã chọn ${selectedFiles.length} tài liệu.` });
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
       {/* --- HEADER --- */}
       <div className="bg-white border-b px-6 py-4 flex justify-between items-start shadow-sm z-10">
            <div className="space-y-1">
                {/* Tên Task (Fix hiển thị) */}
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                    <CheckCircle className="w-5 h-5 text-indigo-600"/>
                    {displayTaskName}
                </h2>
                
                {/* Tên Dự Án (Đã sửa để hiện đúng) */}
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Layers className="w-4 h-4 text-slate-400"/>
                    <span className="text-indigo-900 font-semibold">{displayProjectName}</span>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                    <span className={cn(
                        "px-2 py-0.5 rounded border font-medium",
                        task.tag ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                        {task.tag ? `TAG: ${task.tag}` : "NO TAG"}
                    </span>
                    <span>•</span>
                    <span>ID: #{task.id}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right mr-2 hidden sm:block">
                <p className="text-xs text-slate-500">Đã chọn</p>
                <p className="text-lg font-bold text-indigo-600 leading-none">
                   {selectedFiles.length} <span className="text-sm font-normal text-slate-400">files</span>
                </p>
              </div>
              <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                <CheckCircle className="w-4 h-4 mr-2" /> Xác nhận
              </Button>
            </div>
       </div>

       {/* --- CONTENT (Giữ nguyên logic hiển thị file) --- */}
       <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
           {loading ? (
               <div className="h-full flex flex-col items-center justify-center bg-white rounded-lg border">
                   <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2"/>
                   <p className="text-sm text-slate-500">Đang tìm tài liệu phù hợp...</p>
               </div>
           ) : (
               <div className="bg-white rounded-lg border shadow-sm flex flex-col flex-1 overflow-hidden">
                   <div className="border-b px-4 py-3 bg-slate-50 flex items-center gap-2 text-sm text-slate-600 overflow-x-auto">
                       {breadcrumbs.map((crumb, idx) => (
                           <div key={crumb.id} className="flex items-center whitespace-nowrap">
                               <span 
                                   className={cn(
                                       "cursor-pointer hover:text-indigo-600 hover:underline flex items-center gap-1",
                                       idx === breadcrumbs.length - 1 ? "font-bold text-slate-900" : ""
                                   )}
                                   onClick={() => handleBreadcrumbClick(crumb, idx)}
                               >
                                   {idx === 0 && <Home className="w-3.5 h-3.5" />}
                                   {crumb.name}
                               </span>
                               {idx < breadcrumbs.length-1 && <ChevronRight className="w-4 h-4 mx-2 text-slate-400"/>}
                           </div>
                       ))}
                   </div>
                   
                   <div className="p-4 overflow-y-auto flex-1">
                       {items.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-slate-400">
                               <Folder className="w-16 h-16 text-slate-200 mb-2"/>
                               <p>Thư mục trống</p>
                           </div>
                       ) : (
                           <div className="grid grid-cols-1 gap-2">
                               {items.map(item => {
                                   const isSelected = selectedFiles.some(f => f.id === item.id);
                                   const isDenied = item.access === 'DENIED';
                                   return (
                                       <div 
                                           key={item.id} 
                                           className={cn(
                                               "flex items-center justify-between p-3 border rounded-lg transition-all",
                                               isDenied ? "bg-slate-50 opacity-60 cursor-not-allowed" : "hover:bg-slate-50 hover:border-indigo-300 cursor-pointer",
                                               isSelected && "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"
                                           )}
                                           onClick={() => !isDenied && item.type === 'FILE' && toggleFile(item)}
                                       >
                                           <div className="flex items-center gap-3 flex-1 min-w-0"
                                                onClick={(e) => {
                                                    if (!isDenied && item.type === 'FOLDER') {
                                                        e.stopPropagation();
                                                        handleNavigate(item);
                                                    }
                                                }}>
                                               {item.type === 'FOLDER' ? (
                                                   <div className="w-10 h-10 bg-yellow-100 rounded flex items-center justify-center shrink-0">
                                                        <Folder className="w-5 h-5 text-yellow-600 fill-yellow-500"/>
                                                   </div>
                                               ) : (
                                                   <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center shrink-0">
                                                        <FileText className="w-5 h-5 text-blue-600"/>
                                                   </div>
                                               )}
                                               <div className="flex-1 min-w-0">
                                                   <div className="flex items-center gap-2">
                                                       <span className="font-medium text-slate-900 truncate">{item.name}</span>
                                                       {isDenied && <Lock className="w-3 h-3 text-red-500"/>}
                                                   </div>
                                                   {item.tag && (
                                                       <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">
                                                           {item.tag}
                                                       </span>
                                                   )}
                                               </div>
                                           </div>
                                           <div className="flex items-center gap-2">
                                               {item.type === 'FILE' && !isDenied && (
                                                   <>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={(e) => { e.stopPropagation(); window.open(item.link, '_blank'); }}>
                                                            <Eye className="w-4 h-4"/>
                                                        </Button>
                                                        <Checkbox checked={isSelected} onCheckedChange={() => toggleFile(item)} className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"/>
                                                   </>
                                               )}
                                               {item.type === 'FOLDER' && !isDenied && (
                                                   <Button variant="ghost" size="sm" onClick={() => handleNavigate(item)} className="text-slate-500">
                                                       Mở <ChevronRight className="w-4 h-4 ml-1"/>
                                                   </Button>
                                               )}
                                           </div>
                                       </div>
                                   );
                               })}
                           </div>
                       )}
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};