import { useEffect, useState } from "react";
import { FolderSearch, AlertCircle, Loader2, Files } from "lucide-react";
import { Task } from "@/entities/task";
import { driveApi, DriveItem } from "@/entities/drive";
import { FileItem } from "./file-item";

interface TaskDocumentListProps {
  task: Task;
}

export const TaskDocumentList = ({ task }: TaskDocumentListProps) => {
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      // 1. Validate Input
      if (!task.biddingProjectId) {
        setErrorMsg("Công việc này không thuộc dự án nào.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        // --- STEP 1: Lấy danh sách Folder ở Root ---
        const projectFoldersRes = await driveApi.getProjectFolders(task.biddingProjectId);
        const rootItems = projectFoldersRes.data || [];

        const folders = rootItems.filter(item => item.type === "FOLDER");
        
        // Khởi tạo mảng file (lấy file ở root trước nếu có)
        let collectedFiles: DriveItem[] = rootItems.filter(item => item.type === "FILE");

        // --- STEP 2: Gọi tuần tự từng Folder để lấy file ---
        if (folders.length > 0) {
          for (const folder of folders) {
            try {
              const res = await driveApi.getFolderDetail(folder.id);
              const filesInThisFolder = (res.data || []).filter(i => i.type === "FILE");
              
              // Cộng dồn vào danh sách
              collectedFiles = [...collectedFiles, ...filesInThisFolder];
            } catch (err) {
              console.warn(`Lỗi lấy file folder: ${folder.name}`, err);
              continue; 
            }
          }
        }

        setFiles(collectedFiles);

      } catch (error) {
        console.error("Lỗi tải tài liệu:", error);
        setErrorMsg("Có lỗi khi kết nối Google Drive.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [task.id, task.biddingProjectId]);

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#009d98]" />
        <span className="text-xs font-medium uppercase tracking-wide animate-pulse">Đang quét tài liệu...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <AlertCircle className="w-8 h-8 mb-2 opacity-40 text-red-400" />
        <p className="text-sm">{errorMsg}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <FolderSearch className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-sm font-medium">Không tìm thấy tài liệu liên quan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Files className="w-4 h-4" />
          Tài liệu đính kèm ({files.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {files.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
};