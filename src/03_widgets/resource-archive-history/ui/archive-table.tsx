import { Eye, FileArchive, FolderClosed } from "lucide-react";
import { ResourceItem } from "@/entities/resource";

interface ArchiveTableProps {
  projects: ResourceItem[];
  isLoading: boolean;
  yearLabel: number;
  // [MỚI]: Thêm callback để mở dự án ngay trong app
  onOpenProject: (project: ResourceItem) => void;
}

export const ArchiveTable = ({ projects, isLoading, yearLabel, onOpenProject }: ArchiveTableProps) => {
  
  // [MOCK HELPER]: Hàm tạo màu ngẫu nhiên cho số lượng file
  const getBadgeColor = (count: number) => {
    if (count > 100) return "bg-blue-100 text-blue-700";
    if (count > 50) return "bg-green-100 text-green-700";
    return "bg-slate-100 text-slate-700";
  };

  // [MOCK HELPER]: Hàm giả lập tên Chủ đầu tư dựa trên Index
  const getMockInvestor = (index: number) => {
    const investors = ["EVN NPT", "PC1 Group", "Samsung Electronics", "Sungroup", "Vingroup", "BQL DA Điện"];
    return investors[index % investors.length];
  };

  // [MOCK HELPER]: Hàm sinh mã dự án giả
  const getMockProjectCode = (index: number) => {
    const suffix = (index + 1).toString().padStart(3, '0');
    return `PC1-${yearLabel}-${suffix}`;
  };

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
        <span className="text-slate-500 font-medium text-lg">Trống trải quá!</span>
        <span className="text-slate-400 text-sm mt-1">Không có hồ sơ dự án nào được lưu trữ trong năm {yearLabel}.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 font-bold text-slate-800 bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span>Danh sách hồ sơ</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] uppercase">Năm {yearLabel}</span>
        </div>
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          {projects.length} kết quả
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-slate-400 text-[11px] uppercase font-bold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 tracking-widest">Mã Dự Án</th>
              <th className="px-6 py-4 tracking-widest">Tên Dự Án</th>
              <th className="px-6 py-4 tracking-widest">Chủ Đầu Tư</th>
              <th className="px-6 py-4 tracking-widest text-center">Tài liệu</th>
              <th className="px-6 py-4 tracking-widest">Ngày lưu</th>
              <th className="px-6 py-4 tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {projects.map((project, index) => {
              const fileCount = Math.floor(Math.random() * 150) + 10; 
              const mockDate = `15/${(index % 12) + 1}/${yearLabel}`; 

              return (
                <tr key={project.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                    {getMockProjectCode(index)}
                  </td>
                  <td className="px-6 py-4 min-w-[280px]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <FileArchive className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors truncate max-w-[200px]" title={project.name}>
                        {project.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                    {getMockInvestor(index)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${getBadgeColor(fileCount)}`}>
                      {fileCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs font-medium whitespace-nowrap">
                    {mockDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* [SỬA]: Gọi hàm onOpenProject thay vì mở link Drive bên ngoài */}
                    <button 
                      onClick={() => onOpenProject(project)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-xs font-bold shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem hồ sơ
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};