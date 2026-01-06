"use client";

import { Filter, RotateCcw } from "lucide-react";

interface FilterSectionProps {
  title: string;
  options: string[];
}

const FilterSection = ({ title, options }: FilterSectionProps) => (
  <div className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
    <h4 className="font-bold text-slate-800 mb-3 text-[11px] uppercase tracking-widest text-blue-600/80">
      {title}
    </h4>
    <div className="space-y-2.5">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all" 
          />
          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
            {opt}
          </span>
        </label>
      ))}
    </div>
  </div>
);

export const AdvancedFilterSidebar = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-800">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-sm tracking-tight">BỘ LỌC TÌM KIẾM</span>
        </div>
        <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors" title="Làm mới">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-6">
        <FilterSection 
          title="Năm lưu trữ" 
          options={["2025", "2024", "2023", "2022", "2021"]} 
        />
        
        <FilterSection 
          title="Chủ đầu tư" 
          options={["EVN NPT", "PC1 Group"]} 
        />

        <FilterSection 
          title="Lĩnh vực" 
          options={["Xây lắp", "Hàng Hóa", "Hỗn Hợp", "Tư vấn"]} 
        />
      </div>

      <button className="w-full mt-8 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]">
        Áp dụng bộ lọc
      </button>
    </div>
  );
};