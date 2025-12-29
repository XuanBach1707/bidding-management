import { FileText, ExternalLink, Download } from "lucide-react";
import { DriveItem } from "@/entities/drive";

interface FileItemProps {
  file: DriveItem;
}

export const FileItem = ({ file }: FileItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group">
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Icon theo loại file (Tạm thời để FileText chung, sau này có thể check mimeType) */}
        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600">
          <FileText className="w-4 h-4" />
        </div>
        
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700">
            {file.name}
          </span>
          <span className="text-xs text-gray-400">
            {/* Nếu có size thì hiển thị, hiện tại API chưa thấy trả về size nên để placeholder hoặc ẩn */}
            Google Drive File
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {file.link && (
          <a 
            href={file.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded"
            title="Mở trong tab mới"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};