"use client";

import { useEffect, useState, useRef } from "react";
import { DriveItem } from "@/entities/drive"; 
import { driveApi } from "@/entities/drive/api/drive-api"; 
import { FileText, ExternalLink, Loader2, User } from "lucide-react";

// --- GLOBAL CACHE & QUEUE (Nằm ngoài component để chia sẻ giữa các dòng) ---

// 1. Cache: Lưu ID các folder cha để không phải tìm đi tìm lại
const folderCache: Record<string, string> = {}; 
// VD: { "ROOT_KHO_TAI_LIEU": "id_123", "Hồ sơ pháp lý": "id_456" }

// 2. Queue: Hàng đợi xử lý tuần tự
const requestQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

// Hàm xử lý hàng đợi
const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const task = requestQueue.shift(); // Lấy task đầu tiên
    if (task) {
      await task(); // Chờ task chạy xong
      // Nghỉ 300ms giữa các request để Google không chặn
      await new Promise((resolve) => setTimeout(resolve, 300)); 
    }
  }

  isProcessingQueue = false;
};

// Hàm đẩy task vào hàng đợi
const enqueueTask = (task: () => Promise<void>) => {
  requestQueue.push(task);
  processQueue();
};

// ----------------------------------------------------------------------

interface Props {
  taskName: string;
}

export const AutoFetchFileCell = ({ taskName }: Props) => {
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true); // Để check component còn mount không

  // Chỉ fetch cho các đầu mục lớn
  const TARGET_TASKS = ["Hồ sơ pháp lý", "Hồ sơ tài chính", "Hồ sơ nhân sự", "Biện pháp thi công"]; 
  const shouldFetch = TARGET_TASKS.some(t => taskName.toLowerCase().includes(t.toLowerCase()));

  useEffect(() => {
    mountedRef.current = true;

    if (!shouldFetch) {
      setLoading(false);
      return;
    }

    // Định nghĩa công việc cần làm (nhưng chưa chạy ngay)
    const fetchJob = async () => {
      if (!mountedRef.current) return;

      try {
        // BƯỚC 1: Tìm ID của "KHO TÀI LIỆU" (Dùng Cache nếu có)
        let khoTaiLieuId = folderCache["ROOT_KHO_TAI_LIEU"];
        
        if (!khoTaiLieuId) {
            // Nếu chưa có trong cache thì mới gọi API
            const rootRes = await driveApi.getRootProjects();
            const khoFolder = rootRes.data.find(
                (item) => item.name === "KHO TÀI LIỆU" && item.type === "FOLDER"
            );
            if (!khoFolder) {
                if (mountedRef.current) setLoading(false);
                return;
            }
            khoTaiLieuId = khoFolder.id;
            folderCache["ROOT_KHO_TAI_LIEU"] = khoTaiLieuId; // Lưu Cache
        }

        // BƯỚC 2: Tìm ID của Folder Task (VD: "Hồ sơ pháp lý")
        // Key cache sẽ là: "KHO_ID_TaskName" để tránh trùng tên ở dự án khác
        const cacheKeyTask = `${khoTaiLieuId}_${taskName.trim().toLowerCase()}`;
        let taskFolderId = folderCache[cacheKeyTask];

        if (!taskFolderId) {
            const subRes = await driveApi.getFolderDetail(khoTaiLieuId);
            const targetFolder = subRes.data.find(
                (item) => item.name.trim().toLowerCase() === taskName.trim().toLowerCase() && item.type === "FOLDER"
            );
            
            if (!targetFolder) {
                if (mountedRef.current) setLoading(false);
                return;
            }
            taskFolderId = targetFolder.id;
            folderCache[cacheKeyTask] = taskFolderId; // Lưu Cache
        }

        // BƯỚC 3: Lấy File trong folder đích (Bước này luôn phải gọi mới nhất)
        const filesRes = await driveApi.getFolderDetail(taskFolderId);
        const foundFiles = filesRes.data.filter((i) => i.type === "FILE");

        if (mountedRef.current) {
          setFiles(foundFiles);
          setLoading(false);
        }

      } catch (err) {
        console.error(`Lỗi fetch file [${taskName}]:`, err);
        if (mountedRef.current) setLoading(false);
      }
    };

    // Đẩy việc vào hàng đợi thay vì chạy ngay lập tức
    enqueueTask(fetchJob);

    return () => { mountedRef.current = false; };
  }, [taskName, shouldFetch]);

  // --- RENDER ---
  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-slate-400" />;
  
  if (files.length > 0) {
    const mainFile = files[0];
    const moreCount = files.length - 1;
    
    return (
      <div className="group flex items-center gap-2 max-w-[180px]">
        <div className="h-6 w-6 rounded bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-600">
           <FileText className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col min-w-0">
           <a 
             href={mainFile.link} 
             target="_blank"
             rel="noopener noreferrer"
             className="flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-blue-600 hover:underline truncate"
             title={mainFile.name}
           >
             {mainFile.name}
             <ExternalLink className="h-2 w-2 opacity-50" />
           </a>
           {moreCount > 0 && (
             <span className="text-[9px] text-slate-400">+{moreCount} file khác</span>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 opacity-50">
       <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          <User className="h-3 w-3 text-slate-400" />
       </div>
       <span className="text-[10px] italic text-slate-400">--</span>
    </div>
  );
};