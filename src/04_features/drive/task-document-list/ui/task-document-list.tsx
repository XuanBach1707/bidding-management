import { useEffect, useState } from "react";
import { FolderSearch, AlertCircle, Loader2 } from "lucide-react";
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
        setErrorMsg("Công việc không thuộc dự án nào.");
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
        // Dùng for...of để await lần lượt, tránh spam request cùng lúc
        if (folders.length > 0) {
          for (const folder of folders) {
            try {
              const res = await driveApi.getFolderDetail(folder.id);
              const filesInThisFolder = (res.data || []).filter(i => i.type === "FILE");
              
              // Cộng dồn vào danh sách
              collectedFiles = [...collectedFiles, ...filesInThisFolder];
            } catch (err) {
              console.warn(`Không thể lấy file trong folder: ${folder.name}`, err);
              // Nếu 1 folder lỗi thì bỏ qua, vẫn chạy tiếp folder sau
              continue; 
            }
          }
        }

        setFiles(collectedFiles);

      } catch (error) {
        console.error("Lỗi tải tài liệu:", error);
        setErrorMsg("Có lỗi xảy ra khi tải tài liệu từ Drive.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [task.id, task.biddingProjectId]);

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span className="text-sm">Đang quét tài liệu (Lần lượt)...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
        <p className="text-sm">{errorMsg}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <FolderSearch className="w-10 h-10 mb-2 opacity-50" />
        <p className="text-sm">Không tìm thấy file nào trong các thư mục.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="text-sm font-bold text-gray-700 uppercase">
          Tất cả tài liệu ({files.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {files.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
};