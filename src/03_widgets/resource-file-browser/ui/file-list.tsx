import { FileText, File, FileSpreadsheet, FileImage, ExternalLink, FileArchive, Download, MoreHorizontal } from "lucide-react";
import { ResourceItem } from "@/entities/resource";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface FileListProps {
  items: ResourceItem[];
}

export const FileList = ({ items }: FileListProps) => {
  
  // Helper lấy icon (Dùng chung cho cả Mobile và Desktop)
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const wrapperClass = (bg: string, text: string) => `p-2 rounded-lg ${bg} ${text} shrink-0`;

    if (['pdf'].includes(ext!)) return <div className={wrapperClass("bg-red-50", "text-red-600")}><FileText className="w-5 h-5" /></div>;
    if (['xls', 'xlsx', 'csv'].includes(ext!)) return <div className={wrapperClass("bg-green-50", "text-green-600")}><FileSpreadsheet className="w-5 h-5" /></div>;
    if (['doc', 'docx'].includes(ext!)) return <div className={wrapperClass("bg-blue-50", "text-blue-600")}><FileText className="w-5 h-5" /></div>;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext!)) return <div className={wrapperClass("bg-purple-50", "text-purple-600")}><FileImage className="w-5 h-5" /></div>;
    if (['zip', 'rar', '7z'].includes(ext!)) return <div className={wrapperClass("bg-orange-50", "text-orange-600")}><FileArchive className="w-5 h-5" /></div>;
    
    return <div className={wrapperClass("bg-slate-100", "text-slate-500")}><File className="w-5 h-5" /></div>;
  };

  if (items.length === 0) return null;

  return (
    <div className="pb-10 md:pb-0">
      <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest px-1 flex items-center gap-2">
        <FileText className="w-4 h-4" /> Tập tin ({items.length})
      </h4>

      {/* --- VIEW 1: MOBILE CARD LIST (Chỉ hiện trên Mobile) --- */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3 relative active:scale-[0.99] transition-transform">
            {/* Icon */}
            {getFileIcon(item.name)}
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                  <h5 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 break-all" title={item.name}>
                    {item.name}
                  </h5>
                  {/* Action Link Mobile: Luôn hiện nếu có link */}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="p-1.5 -mt-1.5 -mr-1 text-slate-400 hover:text-[#009d98] active:bg-slate-100 rounded-lg">
                       <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  <span className="text-[11px] text-slate-400 font-mono">
                     {item.updatedAt ? format(new Date(item.updatedAt), "dd/MM/yyyy", { locale: vi }) : "--"}
                  </span>
                  
                  {item.tag && (
                     <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                        {item.tag}
                     </span>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- VIEW 2: DESKTOP TABLE (Chỉ hiện trên Desktop) --- */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 w-[50%]">Tên tài liệu</th>
                <th className="px-6 py-3 w-[20%]">Tag</th>
                <th className="px-6 py-3 w-[20%]">Cập nhật</th>
                <th className="px-6 py-3 w-[10%] text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-4">
                      {getFileIcon(item.name)}
                      <span className="text-slate-700 font-medium truncate max-w-xs md:max-w-md group-hover:text-[#009d98] transition-colors" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                      {item.tag ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          {item.tag}
                        </span>
                      ) : <span className="text-slate-300 text-xs italic">-</span>}
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs font-mono">
                    {item.updatedAt 
                      ? format(new Date(item.updatedAt), "HH:mm dd/MM/yyyy", { locale: vi }) 
                      : "--"}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {item.link && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#009d98] hover:bg-[#009d98]/10" asChild title="Mở file">
                            <a href={item.link} target="_blank" rel="noreferrer">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};