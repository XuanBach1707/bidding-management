"use client";

import { useEffect, useState, useRef } from "react";
import { DriveItem } from "@/entities/drive"; 
import { driveApi } from "@/entities/drive/api/drive-api"; 
import { FileText, ExternalLink, Loader2, User } from "lucide-react";

// --- GLOBAL CACHE & QUEUE (Giữ nguyên logic này vì nó đang tốt) ---
const folderCache: Record<string, string> = {}; 
const requestQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  while (requestQueue.length > 0) {
    const task = requestQueue.shift();
    if (task) {
      await task();
      await new Promise((resolve) => setTimeout(resolve, 300)); 
    }
  }
  isProcessingQueue = false;
};

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
  const mountedRef = useRef(true);

  // [CẬP NHẬT] Thêm các từ khóa biến thể vào đây để "bắt" được task
  // Ví dụ: BE trả về "Báo cáo tài chính" thì mình vẫn phải nhận diện để đi tìm
  const TARGET_KEYWORDS = ["pháp lý", "tài chính", "nhân sự", "biện pháp thi công", "báo cáo tài chính"];
  
  const shouldFetch = TARGET_KEYWORDS.some(k => taskName.toLowerCase().includes(k));

  // [MỚI] Hàm chuẩn hóa tên để tìm Folder
  // Input: "Báo cáo tài chính" -> Output mong đợi: "hồ sơ tài chính"
  const resolveFolderName = (rawName: string): string => {
      const lower = rawName.trim().toLowerCase();
      
      // Map các trường hợp đặc biệt (Fix cứng theo yêu cầu của bạn)
      if (lower.includes("báo cáo tài chính") || lower.includes("hồ sơ tài chính")) {
          return "hồ sơ tài chính"; // Luôn tìm folder có chữ này
      }
      if (lower.includes("pháp lý")) return "hồ sơ pháp lý";
      if (lower.includes("nhân sự")) return "hồ sơ nhân sự";
      if (lower.includes("biện pháp")) return "biện pháp thi công";

      // Mặc định trả về chính nó
      return lower;
  };

  useEffect(() => {
    mountedRef.current = true;

    if (!shouldFetch) {
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      if (!mountedRef.current) return;

      try {
        // BƯỚC 1: Tìm ID của "KHO TÀI LIỆU"
        let khoTaiLieuId = folderCache["ROOT_KHO_TAI_LIEU"];
        if (!khoTaiLieuId) {
            const rootRes = await driveApi.getRootProjects();
            const khoFolder = rootRes.data.find(
                (item) => item.name.trim().toUpperCase() === "KHO TÀI LIỆU" && item.type === "FOLDER"
            );
            if (!khoFolder) {
                if (mountedRef.current) setLoading(false);
                return;
            }
            khoTaiLieuId = khoFolder.id;
            folderCache["ROOT_KHO_TAI_LIEU"] = khoTaiLieuId;
        }

        // BƯỚC 2: Tìm ID của Folder Task
        // Lấy tên Folder chuẩn cần tìm (đã qua hàm resolve)
        const targetFolderName = resolveFolderName(taskName); 
        
        const cacheKeyTask = `${khoTaiLieuId}_${targetFolderName}`;
        let taskFolderId = folderCache[cacheKeyTask];

        if (!taskFolderId) {
            const subRes = await driveApi.getFolderDetail(khoTaiLieuId);
            
            // [LOGIC TÌM KIẾM MỚI] 
            // - Trim() 2 đầu để bỏ dấu cách thừa (Fix lỗi "Hồ sơ tài chính ")
            // - Dùng includes thay vì === để tìm kiếm tương đối
            const targetFolder = subRes.data.find((item) => {
                if (item.type !== "FOLDER") return false;
                
                const itemName = item.name.trim().toLowerCase();
                
                // So sánh: Tên folder chứa keyword HOẶC keyword chứa tên folder
                // VD: Folder="Hồ sơ tài chính " -> trim="hồ sơ tài chính" === target="hồ sơ tài chính" -> OK
                return itemName === targetFolderName || itemName.includes(targetFolderName);
            });
            
            if (!targetFolder) {
                // Log nhẹ để debug nếu vẫn không tìm thấy
                // console.log(`Không tìm thấy folder: [${targetFolderName}] trong list`, subRes.data.map(i => i.name));
                if (mountedRef.current) setLoading(false);
                return;
            }
            taskFolderId = targetFolder.id;
            folderCache[cacheKeyTask] = taskFolderId;
        }

        // BƯỚC 3: Lấy File
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

    enqueueTask(fetchJob);

    return () => { mountedRef.current = false; };
  }, [taskName, shouldFetch]);

  // --- RENDER (Giữ nguyên) ---
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

  // Fallback UI khi không tìm thấy file hoặc không phải task cần tìm
  return (
    <div className="flex items-center gap-1.5 opacity-50">
       <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          <User className="h-3 w-3 text-slate-400" />
       </div>
       <span className="text-[10px] italic text-slate-400">--</span>
    </div>
  );
};