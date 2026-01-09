import { useEffect, useState, useRef } from "react";
import { Folder, FileText, ArrowRight, Loader2, Copy } from "lucide-react";
import { Task } from "@/entities/task";
import { driveApi, DriveItem } from "@/entities/drive";
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils";

// --- CONFIG ---
const REPO_FOLDERS: DriveItem[] = [
  { id: "1GCCzpZ1eSDKWnKjz49pxLYt2GF5mBiho", name: "Hồ sơ nhân sự", type: "FOLDER", link: "", access: "GRANTED", tag: "HR" },
  { id: "1lIORq96SzHHCak_-L03Hlyh-gczpq4vo", name: "Hồ sơ máy móc thiết bị", type: "FOLDER", link: "", access: "GRANTED", tag: "DEVICE" },
  { id: "1FpkXhW5fYs4NNv69Deoy2IX2R0ZVSzRA", name: "Hồ sơ hợp đồng tương tự", type: "FOLDER", link: "", access: "GRANTED", tag: "CONTRACT" },
  { id: "1UptUAAu9N_jsDVdgdzVGek2sXS24J6gZ", name: "Biện pháp thi công", type: "FOLDER", link: "", access: "GRANTED", tag: "TECH" },
  { id: "1CtpQmOWt3Rs0TLpQ2z-ocbakZ-WkWrtd", name: "Hồ sơ tài chính", type: "FOLDER", link: "", access: "GRANTED", tag: "FINANCE" },
  { id: "1T5EiMw9Zc62ovhivZeXIwqIU3UrSYNP2", name: "Hồ sơ pháp lý", type: "FOLDER", link: "", access: "GRANTED", tag: "LEGAL" },
  { id: "1M_4VFwQPU_VO_a9-atV7YdGcIEUXkPSS", name: "Hồ sơ khác", type: "FOLDER", link: "", access: "GRANTED", tag: "OTHER" },
];

interface ResourceRepositoryBrowserProps {
  task: Task;
  preloadedTargetId: string | null;
  onSuccess: () => void;
}

export const ResourceRepositoryBrowser = ({ task, preloadedTargetId, onSuccess }: ResourceRepositoryBrowserProps) => {
  const { toast } = useToast();
  
  // STATE
  const [resourceFolders, setResourceFolders] = useState<DriveItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [sourceFiles, setSourceFiles] = useState<DriveItem[]>([]);
  
  const [localTargetId, setLocalTargetId] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [cloningId, setCloningId] = useState<string | null>(null);
  
  const fetchTargetCalled = useRef(false);

  // --- LOGIC 1: LỌC FOLDER & AUTO-SELECT ---
  useEffect(() => {
    let filtered: DriveItem[] = [];
    if (task.tag) {
       filtered = REPO_FOLDERS.filter(f => f.tag === task.tag);
    } else {
       filtered = REPO_FOLDERS;
    }
    setResourceFolders(filtered);

    if (filtered.length > 0 && !selectedFolderId) {
       handleSelectFolder(filtered[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.tag]);

  // --- LOGIC 2: TỰ ĐỘNG LẤY TARGET ID ---
  useEffect(() => {
    if (preloadedTargetId || localTargetId || fetchTargetCalled.current || !task.biddingProjectId) return;
    
    const fetchTargetIdFallback = async () => {
      fetchTargetCalled.current = true;
      try {
        const resProject = await driveApi.getProjectFolders(task.biddingProjectId!);
        
        if (resProject.currentFolderId) {
            const resTarget = await driveApi.getTargetFolder(resProject.currentFolderId, task.biddingProjectId!);
            if (resTarget.targetFolderId) {
                setLocalTargetId(resTarget.targetFolderId);
            }
        }
      } catch (error) {
        console.error("Lỗi lấy target folder:", error);
      }
    };

    fetchTargetIdFallback();
  }, [preloadedTargetId, localTargetId, task.biddingProjectId]);

  // --- LOGIC 3: LOAD FILE ---
  const handleSelectFolder = async (folderId: string) => {
    if (folderId === selectedFolderId && sourceFiles.length > 0) return;
    setSelectedFolderId(folderId);
    setSourceFiles([]);
    setIsLoadingFiles(true);
    try {
      const res = await driveApi.getFolderDetail(folderId);
      setSourceFiles(res.data.filter(i => i.type === "FILE"));
    } catch (error) {
      toast({ variant: "destructive", description: "Lỗi tải file mẫu." });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // --- LOGIC 4: CLONE FILE ---
  const handleCloneFile = async (file: DriveItem) => {
    const finalTargetId = preloadedTargetId || localTargetId;

    if (!finalTargetId) {
      return toast({ variant: "destructive", description: "Lỗi: Không tìm thấy thư mục đích." });
    }

    try {
      setCloningId(file.id);
      
      await driveApi.cloneFile({
        sourceFileId: file.id,
        targetFolderId: finalTargetId
      });

      toast({ title: "Thành công", description: `Đã lấy file "${file.name}"`, className: "bg-[#009d98] text-white border-none" });
      
      if (onSuccess) {
          onSuccess();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể copy file này." });
    } finally {
      setCloningId(null);
    }
  };

  // --- RENDER ---
  return (
    <div className="flex h-full border-t border-slate-200 bg-white">
      
      {/* CỘT TRÁI: DANH MỤC */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50/50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase flex justify-between items-center">
          <span>Danh mục nguồn</span>
          <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{resourceFolders.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {resourceFolders.length === 0 ? (
             <div className="text-center py-10 px-4">
                <p className="text-xs text-slate-400">Không tìm thấy thư mục khớp với thẻ: <span className="font-bold text-slate-600">{task.tag}</span></p>
             </div>
          ) : (
            resourceFolders.map(folder => (
              <button
                key={folder.id}
                onClick={() => handleSelectFolder(folder.id)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg text-sm flex items-center gap-3 transition-all",
                  selectedFolderId === folder.id 
                    ? "bg-white text-[#009d98] font-bold shadow-sm ring-1 ring-[#009d98]/20" 
                    : "hover:bg-slate-100 text-slate-600"
                )}
              >
                <Folder className={cn("w-5 h-5 flex-shrink-0 transition-colors", selectedFolderId === folder.id ? "fill-[#009d98]/20 text-[#009d98]" : "fill-slate-200 text-slate-400")} />
                <span className="truncate">{folder.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* CỘT PHẢI: FILE LIST */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase flex justify-between items-center h-[53px]">
          <span>Tài liệu mẫu {selectedFolderId ? `(${sourceFiles.length})` : ""}</span>
          {isLoadingFiles && <div className="flex items-center gap-2 text-[#009d98]"><Loader2 className="w-3 h-3 animate-spin"/> <span className="text-[10px]">Đang tải...</span></div>}
        </div>
        
        <div className="flex-1 overflow-y-auto p-0">
          {!selectedFolderId ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
               <div className="p-4 bg-slate-50 rounded-full"><ArrowRight className="w-6 h-6 text-slate-300" /></div>
               <p className="text-sm">Chọn một danh mục bên trái để xem file</p>
            </div>
          ) : isLoadingFiles ? (
            <div className="h-full flex items-center justify-center text-slate-400">
               <Loader2 className="w-8 h-8 animate-spin text-[#009d98]" />
            </div>
          ) : sourceFiles.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Thư mục trống</div>
          ) : (
            <div className="divide-y divide-slate-50">
               {sourceFiles.map(file => (
                 <div key={file.id} className="flex items-center justify-between p-3.5 hover:bg-[#009d98]/5 group transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-[#009d98] group-hover:shadow-sm transition-all border border-slate-100">
                         <FileText className="w-5 h-5" />
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm text-slate-700 truncate font-medium group-hover:text-[#009d98] transition-colors">{file.name}</p>
                       </div>
                    </div>
                    
                    {/* BUTTON CLONE */}
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                          e.stopPropagation(); 
                          handleCloneFile(file);
                      }}
                      disabled={cloningId === file.id} 
                      className={cn(
                          "h-8 text-xs font-semibold transition-all shadow-none",
                          cloningId === file.id 
                            ? "bg-slate-100 text-slate-400"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-[#009d98] hover:text-[#009d98]"
                      )}
                    >
                      {cloningId === file.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Copy className="w-3 h-3 mr-1.5" />}
                      {cloningId === file.id ? "Đang lấy..." : "Chọn File"}
                    </Button>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};