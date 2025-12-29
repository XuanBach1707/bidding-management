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
      if (!task.tag) {
        setErrorMsg("Công việc này chưa được gán Tag (Loại hồ sơ).");
        setLoading(false);
        return;
      }
      if (!task.biddingProjectId) {
        setErrorMsg("Công việc không thuộc dự án nào.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        // 2. Step 1: Lấy danh sách Folder của Project
        // API: GET /bidding-projects/folder/{projectId}/me
        const projectFoldersRes = await driveApi.getProjectFolders(task.biddingProjectId);
        
        // 3. Step 2: Tìm Folder tương ứng với Tag của Task
        // Lưu ý: So sánh tag từ API DriveItem với task.tag
        const targetFolder = projectFoldersRes.data.find(
          (f) => f.tag === task.tag && f.type === "FOLDER"
        );

        if (!targetFolder) {
           setErrorMsg(`Không tìm thấy thư mục hồ sơ cho loại: ${task.tag}`);
           return;
        }

        // 4. Step 3: Lấy danh sách file trong Folder đó
        // API: GET /drive/folder/{folderId}
        const filesRes = await driveApi.getFolderDetail(targetFolder.id);
        
        // Chỉ lấy FILE, bỏ qua folder con (nếu có)
        const onlyFiles = filesRes.data.filter(i => i.type === "FILE");
        setFiles(onlyFiles);

      } catch (error) {
        console.error("Lỗi tải tài liệu:", error);
        setErrorMsg("Có lỗi xảy ra khi tải tài liệu từ Drive.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [task.id, task.tag, task.biddingProjectId]);

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span className="text-sm">Đang đồng bộ tài liệu...</span>
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
        <p className="text-sm">Thư mục hồ sơ trống.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="text-sm font-bold text-gray-700 uppercase">
          Hồ sơ: {task.tag} ({files.length})
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