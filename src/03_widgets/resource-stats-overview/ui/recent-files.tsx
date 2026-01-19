import { FileText, ExternalLink, ArrowRight, FileSpreadsheet, FileIcon, FileCode } from "lucide-react";
import { ResourceItem } from "@/entities/resource";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

interface RecentFilesProps {
  files: ResourceItem[];
  isLoading: boolean;
}

// Helper giữ nguyên
const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
    if (['doc', 'docx'].includes(ext || '')) return <FileText className="w-4 h-4 text-blue-600" />;
    if (['pdf'].includes(ext || '')) return <FileText className="w-4 h-4 text-red-600" />;
    return <FileIcon className="w-4 h-4 text-slate-500" />;
}

export const RecentFiles = ({ files, isLoading }: RecentFilesProps) => {
  if (isLoading) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px]">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </div>
    );
  }

  const recentItems = files.slice(0, 5); 

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
         <h3 className="font-bold text-slate-800 text-xs md:text-sm uppercase tracking-wide">
            Tập tin mới nhất
         </h3>
         <Button variant="link" className="text-xs text-[#009d98] h-auto p-0 hover:text-[#008580]">
            Xem tất cả <ArrowRight className="w-3 h-3 ml-1" />
         </Button>
      </div>
      
      {/* Content Container */}
      <div className="flex-1 overflow-hidden">
        
        {/* VIEW 1: MOBILE LIST (Gọn nhẹ) */}
        <div className="md:hidden">
            {recentItems.length > 0 ? (
                <div className="divide-y divide-slate-50">
                    {recentItems.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between active:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Icon Wrapper */}
                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                                    {getFileIcon(item.name)}
                                </div>
                                {/* File Name Info */}
                                <div className="min-w-0">
                                    <div className="font-medium text-slate-700 text-sm truncate max-w-[200px]" title={item.name}>
                                        {item.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                        {item.name.split('.').pop()?.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Button */}
                            {item.link && (
                                <a href={item.link} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-[#009d98]">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-slate-400 italic text-sm">Chưa có tập tin nào.</div>
            )}
        </div>

        {/* VIEW 2: DESKTOP TABLE (Chi tiết) */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-400 font-medium text-[11px] uppercase bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3">Tên file</th>
                  <th className="px-5 py-3">Định dạng</th>
                  <th className="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentItems.length > 0 ? (
                  recentItems.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                            {getFileIcon(item.name)}
                          </div>
                          <span className="font-medium text-slate-700 truncate max-w-[180px] sm:max-w-xs group-hover:text-[#009d98] transition-colors">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">
                        {item.name.split('.').pop()?.toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {item.link && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#009d98]" asChild>
                              <a href={item.link} target="_blank" rel="noreferrer" title="Mở file">
                                 <ExternalLink className="w-4 h-4" />
                              </a>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-slate-400 italic">
                      Chưa có tập tin nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>

      </div>
    </div>
  );
};