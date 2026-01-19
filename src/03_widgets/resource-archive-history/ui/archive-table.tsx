// archive-table.tsx
"use client";

import { Eye, FileArchive, Building2, SearchX, Calendar } from "lucide-react";
import { BiddingHistoryItem } from "@/entities/resource";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

interface ArchiveTableProps {
  projects: BiddingHistoryItem[];
  isLoading: boolean;
  onOpenProject: (project: BiddingHistoryItem) => void;
}

export const ArchiveTable = ({ projects, isLoading, onOpenProject }: ArchiveTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
             <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-32 hidden md:block" />
             </div>
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 md:p-16 text-center flex flex-col items-center justify-center h-[300px] md:h-[400px]">
        <div className="p-4 bg-slate-50 rounded-full mb-4">
            <SearchX className="w-10 h-10 text-slate-300" />
        </div>
        <span className="text-slate-800 font-bold text-lg">Không tìm thấy dữ liệu</span>
        <span className="text-slate-500 text-sm mt-1 max-w-xs">
          Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để có kết quả.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* HEADER */}
      <div className="px-4 md:px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <FileArchive className="w-4 h-4 text-[#009d98]" />
            <span className="text-sm font-bold text-slate-800">Kết quả tra cứu</span>
        </div>
        <span className="text-[10px] text-[#009d98] bg-[#009d98]/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
          {projects.length} Dự án
        </span>
      </div>
      
      {/* CONTENT */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/30 md:bg-white">
        
        {/* VIEW 1: MOBILE CARD LIST */}
        <div className="md:hidden divide-y divide-slate-100">
            {projects.map((item) => (
                <div key={item.hsmtId} className="p-4 bg-white active:bg-slate-50 transition-colors flex flex-col gap-3">
                    {/* Row 1: Code & Year */}
                    <div className="flex justify-between items-start">
                        <span className="font-mono font-bold text-[#009d98] text-xs bg-[#009d98]/5 px-2 py-1 rounded border border-[#009d98]/20">
                            {item.maTbmt}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            <Calendar className="w-3 h-3" /> {item.nam}
                        </div>
                    </div>

                    {/* Row 2: Name & Tag */}
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-3 mb-1.5">
                            {item.tenDuAn}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-medium border border-slate-200 px-1.5 py-0.5 rounded inline-block">
                            {item.linhVuc || "Chưa phân loại"}
                        </span>
                    </div>

                    {/* Row 3: Investor */}
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{item.chuDauTu}</span>
                    </div>

                    {/* Row 4: Action */}
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onOpenProject(item)}
                        className="w-full mt-1 border-[#009d98] text-[#009d98] hover:bg-[#009d98] hover:text-white"
                    >
                        <Eye className="w-3.5 h-3.5 mr-2" /> Xem hồ sơ chi tiết
                    </Button>
                </div>
            ))}
        </div>

        {/* VIEW 2: DESKTOP TABLE */}
        <div className="hidden md:block">
            <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-white text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                <tr>
                <th className="px-6 py-4 bg-slate-50/80 backdrop-blur w-[120px]">Mã TBMT</th>
                <th className="px-6 py-4 bg-slate-50/80 backdrop-blur">Tên Dự Án</th>
                <th className="px-6 py-4 bg-slate-50/80 backdrop-blur w-[250px]">Chủ Đầu Tư</th>
                <th className="px-6 py-4 bg-slate-50/80 backdrop-blur text-center w-[80px]">Năm</th>
                <th className="px-6 py-4 bg-slate-50/80 backdrop-blur text-right w-[120px]">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {projects.map((item) => (
                <tr key={item.hsmtId} className="hover:bg-[#009d98]/5 transition-colors group">
                    <td className="px-6 py-4 align-top">
                        <span className="font-mono font-bold text-[#009d98] text-xs bg-[#009d98]/5 px-1.5 py-0.5 rounded">
                        {item.maTbmt}
                        </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-800 text-sm group-hover:text-[#009d98] transition-colors leading-snug line-clamp-2" title={item.tenDuAn}>
                            {item.tenDuAn}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium bg-slate-100 w-fit px-1.5 py-0.5 rounded border border-slate-200">
                            {item.linhVuc || "Chưa phân loại"}
                        </span>
                    </div>
                    </td>
                    <td className="px-6 py-4 align-top text-slate-600 text-xs">
                    <div className="flex items-start gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0" />
                        <span className="line-clamp-2" title={item.chuDauTu}>
                        {item.chuDauTu}
                        </span>
                    </div>
                    </td>
                    <td className="px-6 py-4 align-top text-center">
                    <span className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200">
                        {item.nam}
                    </span>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onOpenProject(item)}
                        className="h-8 text-xs gap-1.5 border-slate-200 text-slate-600 hover:text-[#009d98] hover:border-[#009d98] hover:bg-white shadow-sm"
                    >
                        <Eye className="w-3.5 h-3.5" /> Xem
                    </Button>
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