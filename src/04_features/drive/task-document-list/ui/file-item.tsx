import { FileText, ExternalLink, FileSpreadsheet, FileImage, FileArchive, File } from "lucide-react";
import { DriveItem } from "@/entities/drive";
import { Button } from "@/shared/ui/button";

interface FileItemProps {
  file: DriveItem;
}

// Helper chọn icon xịn (Dùng lại logic từ Resource Module cho đồng bộ)
const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    // Style chung wrapper
    const wrapperClass = (bg: string, text: string) => `w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg} ${text}`;

    if (['pdf'].includes(ext!)) return <div className={wrapperClass("bg-red-50", "text-red-600")}><FileText className="w-5 h-5" /></div>;
    if (['xls', 'xlsx', 'csv'].includes(ext!)) return <div className={wrapperClass("bg-green-50", "text-green-600")}><FileSpreadsheet className="w-5 h-5" /></div>;
    if (['doc', 'docx'].includes(ext!)) return <div className={wrapperClass("bg-blue-50", "text-blue-600")}><FileText className="w-5 h-5" /></div>;
    if (['jpg', 'jpeg', 'png'].includes(ext!)) return <div className={wrapperClass("bg-purple-50", "text-purple-600")}><FileImage className="w-5 h-5" /></div>;
    if (['zip', 'rar'].includes(ext!)) return <div className={wrapperClass("bg-orange-50", "text-orange-600")}><FileArchive className="w-5 h-5" /></div>;
    
    return <div className={wrapperClass("bg-slate-100", "text-slate-500")}><File className="w-5 h-5" /></div>;
};

export const FileItem = ({ file }: FileItemProps) => {
  return (
    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#009d98]/50 hover:bg-[#009d98]/5 transition-all group shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        
        {getFileIcon(file.name)}
        
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-slate-700 truncate group-hover:text-[#009d98] transition-colors max-w-[200px]" title={file.name}>
            {file.name}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Google Drive
          </span>
        </div>
      </div>

      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        {file.link && (
          <Button 
            asChild 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-[#009d98] hover:bg-white rounded-full"
          >
            <a 
              href={file.link} 
              target="_blank" 
              rel="noopener noreferrer"
              title="Mở file"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};