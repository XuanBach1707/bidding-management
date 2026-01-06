import { Eye, FileArchive, FolderClosed, Building2 } from "lucide-react";
// Import interface từ model (theo đúng cấu trúc FSD của bạn)
import { BiddingHistoryItem } from "@/entities/resource";

interface ArchiveTableProps {
  // Thay any[] bằng Type chuẩn để code an toàn hơn
  projects: BiddingHistoryItem[];
  isLoading: boolean;
  onOpenProject: (project: BiddingHistoryItem) => void;
}

export const ArchiveTable = ({ projects, isLoading, onOpenProject }: ArchiveTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-slate-100 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 text-center flex flex-col items-center">
        <FolderClosed className="w-16 h-16 text-slate-200 mb-4" />
        <span className="text-slate-500 font-medium text-lg">Không tìm thấy dữ liệu!</span>
        <span className="text-slate-400 text-sm mt-1">
          Vui lòng thử lại với các tiêu chí lọc khác.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 font-bold text-slate-800 bg-slate-50/50 flex justify-between items-center">
        <span className="text-sm">Kết quả tra cứu lịch sử</span>
        <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold uppercase tracking-wider">
          {projects.length} Dự án
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Mã TBMT</th>
              <th className="px-6 py-4">Tên Dự Án</th>
              <th className="px-6 py-4">Chủ Đầu Tư</th>
              <th className="px-6 py-4 text-center">Năm</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {projects.map((item) => (
              <tr key={item.hsmtId} className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                  {item.maTbmt}
                </td>
                <td className="px-6 py-4 min-w-[300px]">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors mt-0.5">
                      <FileArchive className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <div>
                        <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors line-clamp-2" title={item.tenDuAn}>
                         {item.tenDuAn}
                       </span>
                       <span className="text-[10px] text-slate-400 uppercase font-medium">
                         {item.linhVuc || "Chưa phân loại"}
                       </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-300" />
                    {/* [QUAN TRỌNG] Đã sửa lỗi chính tả: chuDuTu -> chuDauTu */}
                    <span className="truncate max-w-[200px]" title={item.chuDauTu}>
                      {item.chuDauTu}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold text-[11px]">
                    {item.nam}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onOpenProject(item)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem hồ sơ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};