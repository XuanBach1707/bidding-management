"use client";

import { Filter, RotateCcw, Check } from "lucide-react";
import { HistoryFilterOptions } from "@/entities/resource/";
import { cn } from "@/shared/lib/utils"; // Giả sử bạn có utility này, hoặc dùng template literal

interface AdvancedFilterSidebarProps {
  options: HistoryFilterOptions;
  // State giờ là mảng (Array)
  selectedYears: number[];
  selectedInvestors: string[];
  
  onYearChange: (years: number[]) => void;
  onInvestorChange: (investors: string[]) => void;
  onReset: () => void;
}

export const AdvancedFilterSidebar = ({
  options,
  selectedYears,
  selectedInvestors,
  onYearChange,
  onInvestorChange,
  onReset
}: AdvancedFilterSidebarProps) => {

  // Helper: Xử lý chọn/bỏ chọn Năm
  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      onYearChange(selectedYears.filter(y => y !== year));
    } else {
      onYearChange([...selectedYears, year]);
    }
  };

  // Helper: Xử lý chọn/bỏ chọn Chủ đầu tư
  const toggleInvestor = (investor: string) => {
    if (selectedInvestors.includes(investor)) {
      onInvestorChange(selectedInvestors.filter(i => i !== investor));
    } else {
      onInvestorChange([...selectedInvestors, investor]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm sticky top-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-800">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-sm tracking-tight">BỘ LỌC</span>
        </div>
        {(selectedYears.length > 0 || selectedInvestors.length > 0) && (
          <button 
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] text-red-500 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors" 
          >
            <RotateCcw className="w-3 h-3" /> Xóa lọc
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* 1. Lọc theo Năm */}
        <div>
          <h4 className="font-bold text-slate-800 mb-3 text-[11px] uppercase tracking-widest text-blue-600/80 flex justify-between">
            Năm thực hiện
            {selectedYears.length > 0 && <span className="text-blue-600">({selectedYears.length})</span>}
          </h4>
          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
            {options?.years?.map((y) => {
              const isSelected = selectedYears.includes(y);
              return (
                <label 
                  key={y} 
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border",
                    isSelected 
                      ? "bg-blue-50 border-blue-200 text-blue-700" 
                      : "hover:bg-slate-50 border-transparent text-slate-600"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isSelected}
                    onChange={() => toggleYear(y)}
                  />
                  <span className="text-sm font-medium">{y}</span>
                </label>
              );
            })}
          </div>
        </div>
        
        <div className="h-px bg-slate-100" />

        {/* 2. Lọc theo Chủ đầu tư */}
        <div>
          <h4 className="font-bold text-slate-800 mb-3 text-[11px] uppercase tracking-widest text-blue-600/80 flex justify-between">
            Chủ đầu tư
            {selectedInvestors.length > 0 && <span className="text-blue-600">({selectedInvestors.length})</span>}
          </h4>
          {/* Scroll area cho list dài */}
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            {options?.investors?.map((inv) => {
              const isSelected = selectedInvestors.includes(inv);
              return (
                <label 
                  key={inv} 
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all border",
                    isSelected 
                      ? "bg-blue-50 border-blue-200 text-blue-700" 
                      : "hover:bg-slate-50 border-transparent text-slate-600"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors mt-0.5 shrink-0",
                    isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isSelected}
                    onChange={() => toggleInvestor(inv)}
                  />
                  <span className="text-sm font-medium leading-tight">{inv}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. Placeholder Lĩnh vực */}
        <div className="pt-2 opacity-50 pointer-events-none">
           {/* Giữ nguyên phần placeholder cũ nếu muốn */}
        </div>
      </div>
    </div>
  );
};