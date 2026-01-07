import { FileText, ExternalLink, File, Folder } from "lucide-react"; // Import thêm icon Folder
import { ResourceItem } from "@/entities/resource";
import { Button } from "@/shared/ui/button";

export const HistoryFileList = ({ items }: { items: ResourceItem[] }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <File className="w-10 h-10 mb-2 opacity-20" />
        <span className="text-sm">Thư mục này chưa có tài liệu nào.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Danh sách tài liệu ({items.length})
        </h4>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-xs uppercase w-[60%]">Tên tài liệu</th>
              {/* [UPDATE] Thêm cột vị trí hoặc gộp vào cột tên đều được, ở đây ta hiển thị dưới tên cho đẹp */}
              <th className="px-6 py-3 font-semibold text-xs uppercase w-[40%] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded text-blue-600 shrink-0">
                       <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      {/* Tên file */}
                      <span className="text-slate-700 font-medium block group-hover:text-blue-700 transition-colors truncate pr-4">
                        {item.name}
                      </span>
                      
                      {/* [MỚI] HIỂN THỊ FOLDER CHA (PARENT NAME) */}
                      {/* Chỉ hiện khi có parentName (tức là khi đang Search) */}
                      {(item as any).parentName && (
                        <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                          <Folder className="w-3 h-3" />
                          <span className="text-[11px] truncate max-w-[200px] md:max-w-[300px]" title={(item as any).parentName}>
                            {(item as any).parentName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-right">
                  {item.link ? (
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-2 text-blue-600 border-blue-100 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Mở tài liệu"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Mở file
                      </a>
                    </Button>
                  ) : (
                    <span className="text-slate-300 text-xs italic">Chưa có link</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};