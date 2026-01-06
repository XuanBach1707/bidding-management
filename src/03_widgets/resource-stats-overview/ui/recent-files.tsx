import { FileText, ExternalLink } from "lucide-react";
import { ResourceItem } from "@/entities/resource";

interface RecentFilesProps {
  files: ResourceItem[];
  isLoading: boolean;
}

export const RecentFiles = ({ files, isLoading }: RecentFilesProps) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm min-h-[200px] animate-pulse">
        <div className="h-5 bg-slate-100 rounded w-48 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-50 rounded w-full"></div>)}
        </div>
      </div>
    );
  }

  // Lấy 5 file đầu tiên (giả sử API trả về sorted, hoặc client tự cắt)
  const recentItems = files.slice(0, 5); 

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-4 uppercase text-sm tracking-wide">
        Tập tin tải lên gần đây
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
            <tr>
              <th className="px-4 py-3 font-medium">Tên file</th>
              <th className="px-4 py-3 font-medium">Định dạng</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-700 truncate max-w-xs">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {/* Mock extension từ tên file */}
                    {item.name.split('.').pop()?.toUpperCase() || "FILE"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium inline-flex items-center gap-1 hover:underline"
                      >
                        Mở file <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  Chưa có tập tin nào gần đây.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};