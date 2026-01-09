import { FileText, File, FileSpreadsheet, FileImage, ExternalLink, FileCode, FileArchive, Download } from "lucide-react";
import { ResourceItem } from "@/entities/resource";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from "@/shared/ui/button";

interface FileListProps {
  items: ResourceItem[];
}

export const FileList = ({ items }: FileListProps) => {
  
  // Helper chọn icon xịn xò
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    // Style chung cho icon box
    const wrapperClass = (bg: string, text: string) => `p-2 rounded-lg ${bg} ${text}`;

    if (['pdf'].includes(ext!)) return <div className={wrapperClass("bg-red-50", "text-red-600")}><FileText className="w-5 h-5" /></div>;
    if (['xls', 'xlsx', 'csv'].includes(ext!)) return <div className={wrapperClass("bg-green-50", "text-green-600")}><FileSpreadsheet className="w-5 h-5" /></div>;
    if (['doc', 'docx'].includes(ext!)) return <div className={wrapperClass("bg-blue-50", "text-blue-600")}><FileText className="w-5 h-5" /></div>;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext!)) return <div className={wrapperClass("bg-purple-50", "text-purple-600")}><FileImage className="w-5 h-5" /></div>;
    if (['zip', 'rar', '7z'].includes(ext!)) return <div className={wrapperClass("bg-orange-50", "text-orange-600")}><FileArchive className="w-5 h-5" /></div>;
    
    return <div className={wrapperClass("bg-slate-100", "text-slate-500")}><File className="w-5 h-5" /></div>;
  };

  if (items.length === 0) {
    return null; // Nếu không có file thì ẩn luôn, hoặc hiển thị message nếu cả folder cũng rỗng
  }

  return (
    <div>
      <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest px-1 flex items-center gap-2">
        <FileText className="w-4 h-4" /> Tập tin ({items.length})
      </h4>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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
                          {/* Nút Download giả lập (nếu cần) */}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#009d98] hover:bg-[#009d98]/10" title="Tải xuống">
                                <Download className="w-4 h-4" />
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