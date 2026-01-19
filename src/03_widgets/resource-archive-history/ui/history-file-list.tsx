// history-file-list.tsx
import { FileText, ExternalLink, File, Folder, Clock, FileSpreadsheet, FileImage, FileArchive } from "lucide-react"; 
import { ResourceItem } from "@/entities/resource";
import { Button } from "@/shared/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const wrapperClass = (bg: string, text: string) => `p-2 rounded-lg ${bg} ${text} shrink-0`;

    if (['pdf'].includes(ext!)) return <div className={wrapperClass("bg-red-50", "text-red-600")}><FileText className="w-4 h-4" /></div>;
    if (['xls', 'xlsx', 'csv'].includes(ext!)) return <div className={wrapperClass("bg-green-50", "text-green-600")}><FileSpreadsheet className="w-4 h-4" /></div>;
    if (['doc', 'docx'].includes(ext!)) return <div className={wrapperClass("bg-blue-50", "text-blue-600")}><FileText className="w-4 h-4" /></div>;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext!)) return <div className={wrapperClass("bg-purple-50", "text-purple-600")}><FileImage className="w-4 h-4" /></div>;
    if (['zip', 'rar', '7z'].includes(ext!)) return <div className={wrapperClass("bg-orange-50", "text-orange-600")}><FileArchive className="w-4 h-4" /></div>;
    
    return <div className={wrapperClass("bg-slate-100", "text-slate-500")}><File className="w-4 h-4" /></div>;
};

export const HistoryFileList = ({ items }: { items: ResourceItem[] }) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Danh sách tài liệu ({items.length})
        </h4>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* VIEW 1: MOBILE LIST (Card View) */}
        <div className="md:hidden divide-y divide-slate-50">
           {items.map((item) => (
             <div key={item.id} className="p-3 active:bg-slate-50 transition-colors flex items-start gap-3">
                {/* Icon */}
                {getFileIcon(item.name)}
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <div className="font-medium text-slate-700 text-sm truncate leading-snug" title={item.name}>
                            {item.name}
                        </div>
                        {/* Action Link Icon Only */}
                        {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#009d98] p-1 -mt-1 -mr-1">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                    
                    {/* Folder path (Search result) */}
                    {item.parentName && (
                        <div className="flex items-center gap-1 mt-1 text-slate-400">
                          <Folder className="w-3 h-3" />
                          <span className="text-[10px] truncate max-w-[150px]">{item.parentName}</span>
                        </div>
                    )}
                    
                    {/* Date */}
                    {item.updatedAt && (
                        <div className="flex items-center gap-1 mt-1 text-slate-400 text-[10px] font-mono">
                            <Clock className="w-3 h-3" />
                            {format(new Date(item.updatedAt), "dd/MM/yyyy", { locale: vi })}
                        </div>
                    )}
                </div>
             </div>
           ))}
        </div>

        {/* VIEW 2: DESKTOP TABLE */}
        <div className="hidden md:block">
            <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200 text-[11px] uppercase font-semibold">
                <tr>
                <th className="px-6 py-3 w-[50%]">Tên tài liệu</th>
                <th className="px-6 py-3 w-[30%]">Cập nhật</th>
                <th className="px-6 py-3 w-[20%] text-right">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                        {getFileIcon(item.name)}
                        <div className="min-w-0">
                        <span className="text-slate-700 font-medium block group-hover:text-[#009d98] transition-colors truncate pr-4 max-w-xs md:max-w-md" title={item.name}>
                            {item.name}
                        </span>
                        {item.parentName && (
                            <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                            <Folder className="w-3 h-3" />
                            <span className="text-[10px] truncate max-w-[200px]" title={item.parentName}>
                                {item.parentName}
                            </span>
                            </div>
                        )}
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {item.updatedAt ? (
                            <div className="flex items-center gap-1.5 font-mono">
                                <Clock className="w-3 h-3 text-slate-300" />
                                {format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </div>
                        ) : (
                            <span className="text-slate-300 text-[10px] italic">--</span>
                        )}
                    </td>
                    <td className="px-6 py-3 text-right">
                    {item.link ? (
                        <Button 
                        asChild 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-2 text-slate-500 hover:text-[#009d98] hover:bg-[#009d98]/5"
                        >
                        <a href={item.link} target="_blank" rel="noopener noreferrer" title="Mở tài liệu">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-xs">Mở file</span>
                        </a>
                        </Button>
                    ) : (
                        <span className="text-slate-300 text-[10px] italic">No Link</span>
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