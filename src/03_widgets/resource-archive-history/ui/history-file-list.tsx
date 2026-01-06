import { FileText, ExternalLink, Download } from "lucide-react";
import { ResourceItem } from "@/entities/resource";

export const HistoryFileList = ({ items }: { items: ResourceItem[] }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        Thư mục này chưa có tài liệu.
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
        Danh sách tài liệu
      </h4>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-bold">Tên tài liệu</th>
              <th className="px-6 py-3 font-bold w-24 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-right">
                  {/* [FIX] Cách 2: Kiểm tra item.link tồn tại mới render thẻ a */}
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg inline-block transition"
                      title="Mở tài liệu"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span 
                      className="p-2 text-slate-300 inline-block cursor-not-allowed"
                      title="Không có liên kết"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </span>
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