import { FileText, File, FileSpreadsheet, FileImage, ExternalLink } from "lucide-react";
import { ResourceItem } from "@/entities/resource";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface FileListProps {
  items: ResourceItem[];
}

export const FileList = ({ items }: FileListProps) => {
  // Hàm helper chọn icon dựa trên tên file hoặc mimeType
  const getFileIcon = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith(".pdf")) return <FileText className="w-4 h-4 text-red-500" />;
    if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
    if (lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return <FileImage className="w-4 h-4 text-purple-500" />;
    return <File className="w-4 h-4 text-slate-400" />;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 border-t border-slate-100">
        Không có tập tin nào trong thư mục này.
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
        Tập tin ({items.length})
      </h4>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Tên tài liệu</th>
                <th className="px-4 py-3 font-medium w-40">Cập nhật lần cuối</th>
                <th className="px-4 py-3 font-medium w-24 text-right">Mở</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(item.name)}
                      <span className="text-slate-700 font-medium truncate max-w-xs md:max-w-md" title={item.name}>
                        {item.name}
                      </span>
                      {/* Hiển thị Tag nếu có */}
                      {item.tag && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                    {/* Hiển thị ngày cập nhật chuẩn xác */}
                    {item.updatedAt 
                      ? format(new Date(item.updatedAt), "HH:mm dd/MM/yyyy", { locale: vi }) 
                      : "--"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                        title="Mở trong tab mới"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
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