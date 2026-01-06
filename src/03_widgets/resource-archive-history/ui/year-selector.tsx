import { Calendar, Filter } from "lucide-react";
import { YearFolder } from "@/entities/resource";

interface YearSelectorProps {
  years: YearFolder[];
  selectedYearId: string | null;
  onYearChange: (yearId: string) => void;
}

export const YearSelector = ({ years, selectedYearId, onYearChange }: YearSelectorProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Lịch sử dự án</h3>
          <p className="text-xs text-slate-500">Tra cứu hồ sơ lưu trữ theo năm</p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter className="w-4 h-4" />
          <span>Chọn năm:</span>
        </div>
        <select
          value={selectedYearId || ""}
          onChange={(e) => onYearChange(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-md text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
        >
          {years.length === 0 && <option value="">Không có dữ liệu</option>}
          
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              Năm {y.year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};