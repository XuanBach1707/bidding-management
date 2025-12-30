import { useEffect, useState, useRef } from "react";
import { Folder, FileText, ArrowRight, Loader2 } from "lucide-react";
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
  
  // State backup: Nếu cha không truyền targetId thì con tự lưu vào đây
  const [localTargetId, setLocalTargetId] = useState<string | null>(null);

  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [cloningId, setCloningId] = useState<string | null>(null);
  
  // Ref để tránh fetch lại nhiều lần
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

  // --- LOGIC 2: TỰ ĐỘNG LẤY TARGET ID NẾU THIẾU ---
  useEffect(() => {
    // Nếu cha đã truyền hoặc đã fetch rồi thì thôi
    if (preloadedTargetId || localTargetId || fetchTargetCalled.current || !task.biddingProjectId) return;
    
    const fetchTargetIdFallback = async () => {
      fetchTargetCalled.current = true;
      try {
        console.log("🛠️ [Browser] Đang tự tìm ID thư mục đích...");
        // B1: Lấy Folder gốc dự án
        const resProject = await driveApi.getProjectFolders(task.biddingProjectId!);
        
        if (resProject.currentFolderId) {
            // B2: Lấy Target ID
            const resTarget = await driveApi.getTargetFolder(resProject.currentFolderId, task.biddingProjectId!);
            if (resTarget.targetFolderId) {
                console.log("✅ [Browser] Đã tự tìm thấy đích:", resTarget.targetFolderId);
                setLocalTargetId(resTarget.targetFolderId);
            }
        }
      } catch (error) {
        console.error("❌ [Browser] Không thể tự lấy thư mục đích:", error);
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

  // --- LOGIC 4: CLONE FILE (FIXED) ---
  const handleCloneFile = async (file: DriveItem) => {
    console.log("🖱️ User clicked Clone:", file.name); // Debug log

    // Ưu tiên dùng của cha (preloaded), nếu không có thì dùng của mình (local)
    const finalTargetId = preloadedTargetId || localTargetId;

    console.log("🎯 Target ID to clone:", finalTargetId); // Debug log

    if (!finalTargetId) {
      return toast({ variant: "destructive", description: "Lỗi: Không tìm thấy thư mục đích để lưu file. Vui lòng thử lại sau giây lát." });
    }

    try {
      setCloningId(file.id);
      
      // Gọi API Clone
      await driveApi.cloneFile({
        sourceFileId: file.id,
        targetFolderId: finalTargetId
      });

      toast({ title: "Thành công", description: `Đã lấy file "${file.name}" về hồ sơ.` });
      
      // Gọi callback để cha reload lại list file
      if (onSuccess) {
          onSuccess();
      }
    } catch (error) {
      console.error("❌ Clone Error:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể copy file này." });
    } finally {
      setCloningId(null);
    }
  };

  // --- RENDER ---
  return (
    <div className="flex h-full border-t bg-white">
      {/* CỘT TRÁI */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-3 bg-gray-100 text-xs font-bold text-gray-500 uppercase flex justify-between">
          <span>Danh mục phù hợp</span>
          <span className="text-blue-600 font-bold">{resourceFolders.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {resourceFolders.length === 0 ? (
             <div className="text-center py-10 px-4">
                <p className="text-xs text-gray-400">Không tìm thấy thư mục mẫu khớp với: <span className="font-bold text-gray-500">{task.tag}</span></p>
             </div>
          ) : (
            resourceFolders.map(folder => (
              <button
                key={folder.id}
                onClick={() => handleSelectFolder(folder.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded text-sm flex items-center gap-2 transition-all",
                  selectedFolderId === folder.id 
                    ? "bg-white text-blue-700 font-bold shadow-sm ring-1 ring-blue-100 border-l-4 border-l-blue-500" 
                    : "hover:bg-gray-200 text-gray-700 border-l-4 border-l-transparent"
                )}
              >
                <Folder className={cn("w-4 h-4 flex-shrink-0", selectedFolderId === folder.id ? "fill-blue-100 text-blue-600" : "fill-gray-300 text-gray-400")} />
                <span className="truncate">{folder.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-3 border-b text-xs font-bold text-gray-500 uppercase flex justify-between items-center h-[41px]">
          <span>Tài liệu mẫu {selectedFolderId ? `(${sourceFiles.length})` : ""}</span>
          {isLoadingFiles && <Loader2 className="w-3 h-3 animate-spin text-blue-500"/>}
        </div>
        
        <div className="flex-1 overflow-y-auto p-0">
          {!selectedFolderId ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <ArrowRight className="w-8 h-8 mb-2 opacity-20" />
               <p className="text-sm">Chọn danh mục bên trái</p>
            </div>
          ) : isLoadingFiles ? (
            <div className="h-full flex items-center justify-center text-gray-400">
               <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
               <p className="text-xs">Đang tải danh sách file...</p>
            </div>
          ) : sourceFiles.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400"><p className="text-sm">Thư mục trống</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
               {sourceFiles.map(file => (
                 <div key={file.id} className="flex items-center justify-between p-3 hover:bg-blue-50 group transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-100">
                         <FileText className="w-4 h-4" />
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm text-gray-700 truncate font-medium group-hover:text-blue-700">{file.name}</p>
                       </div>
                    </div>
                    
                    {/* NÚT CLONE - QUAN TRỌNG */}
                    <Button 
                      size="sm" variant="outline"
                      onClick={(e) => {
                          e.stopPropagation(); // Ngăn sự kiện nổi bọt nếu có
                          handleCloneFile(file);
                      }}
                      disabled={cloningId === file.id} // Disable nút khi đang clone file này
                      className="h-8 text-xs border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-white"
                    >
                      {cloningId === file.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Chọn"}
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