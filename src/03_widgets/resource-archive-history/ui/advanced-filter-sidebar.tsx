"use client";

import { useState } from "react";
import { Filter, RotateCcw, ChevronDown, ChevronRight, Check, Briefcase, Calendar, Building2 } from "lucide-react";
import { HistoryFilterOptions } from "@/entities/resource/";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button"; // Dùng Shadcn Button
import { Badge } from "@/shared/ui/badge";   // Dùng Shadcn Badge (nếu có)

// Fix cứng 3 loại lĩnh vực
const FIELD_OPTIONS = ["Xây lắp", "Hàng hóa", "Hỗn hợp"];

interface AdvancedFilterSidebarProps {
  options: HistoryFilterOptions;
  
  // State Filter
  selectedYears: number[];
  selectedInvestors: string[];
  selectedFields: string[]; // [MỚI] State cho lĩnh vực

  // Handlers
  onYearChange: (years: number[]) => void;
  onInvestorChange: (investors: string[]) => void;
  onFieldChange: (fields: string[]) => void; // [MỚI]
  onReset: () => void;
}

export const AdvancedFilterSidebar = ({
  options,
  selectedYears,
  selectedInvestors,
  selectedFields,
  onYearChange,
  onInvestorChange,
  onFieldChange,
  onReset
}: AdvancedFilterSidebarProps) => {

  // State quản lý đóng mở các section (Mặc định mở Năm và Lĩnh vực)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    years: true,
    fields: true,
    investors: false, // Chủ đầu tư thường dài nên mặc định đóng
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper: Toggle Array Generic
  const toggleItem = <T,>(item: T, current: T[], onChange: (items: T[]) => void) => {
    if (current.includes(item)) {
      onChange(current.filter(i => i !== item));
    } else {
      onChange([...current, item]);
    }
  };

  const hasFilters = selectedYears.length > 0 || selectedInvestors.length > 0 || selectedFields.length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-6 overflow-hidden">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2 text-slate-800">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-sm">Bộ lọc</span>
        </div>
        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="h-7 px-2 text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Xóa
          </Button>
        )}
      </div>

      <div className="p-2 space-y-1">
        
        {/* SECTION 1: LĨNH VỰC (Quan trọng nhất) */}
        <FilterSection 
          title="Lĩnh vực" 
          icon={<Briefcase className="w-3.5 h-3.5" />}
          isOpen={openSections.fields} 
          onToggle={() => toggleSection('fields')}
          count={selectedFields.length}
        >
          <div className="space-y-1">
            {FIELD_OPTIONS.map((field) => (
              <FilterItem 
                key={field} 
                label={field} 
                isSelected={selectedFields.includes(field)} 
                onClick={() => toggleItem(field, selectedFields, onFieldChange)} 
              />
            ))}
          </div>
        </FilterSection>

        {/* SECTION 2: NĂM THỰC HIỆN */}
        <FilterSection 
          title="Năm thực hiện" 
          icon={<Calendar className="w-3.5 h-3.5" />}
          isOpen={openSections.years} 
          onToggle={() => toggleSection('years')}
          count={selectedYears.length}
        >
          <div className="grid grid-cols-2 gap-2">
            {options?.years?.map((y) => (
               <div 
                 key={y}
                 onClick={() => toggleItem(y, selectedYears, onYearChange)}
                 className={cn(
                   "text-center py-1.5 px-2 rounded-md text-xs font-medium cursor-pointer transition-all border",
                   selectedYears.includes(y)
                     ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                     : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                 )}
               >
                 {y}
               </div>
            ))}
          </div>
        </FilterSection>

        {/* SECTION 3: CHỦ ĐẦU TƯ (Danh sách dài) */}
        <FilterSection 
          title="Chủ đầu tư" 
          icon={<Building2 className="w-3.5 h-3.5" />}
          isOpen={openSections.investors} 
          onToggle={() => toggleSection('investors')}
          count={selectedInvestors.length}
        >
          <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            {options?.investors?.map((inv) => (
              <FilterItem 
                key={inv} 
                label={inv} 
                isSelected={selectedInvestors.includes(inv)} 
                onClick={() => toggleItem(inv, selectedInvestors, onInvestorChange)} 
              />
            ))}
          </div>
        </FilterSection>

      </div>
    </div>
  );
};

// --- SUB COMPONENTS CHO GỌN ---

const FilterSection = ({ title, icon, isOpen, onToggle, children, count }: any) => (
  <div className="border border-slate-100 rounded-lg overflow-hidden mb-2">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
        {icon}
        {title}
        {count > 0 && (
          <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px]">
            {count}
          </span>
        )}
      </div>
      {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
    </button>
    
    {isOpen && (
      <div className="p-3 bg-slate-50/30 border-t border-slate-100 animate-in slide-in-from-top-1 duration-200">
        {children}
      </div>
    )}
  </div>
);

const FilterItem = ({ label, isSelected, onClick }: any) => (
  <div 
    onClick={onClick}
    className={cn(
      "flex items-start gap-2.5 p-2 rounded cursor-pointer transition-all group",
      isSelected ? "bg-blue-50" : "hover:bg-slate-100"
    )}
  >
    <div className={cn(
      "w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors shrink-0",
      isSelected 
        ? "bg-blue-600 border-blue-600" 
        : "bg-white border-slate-300 group-hover:border-blue-400"
    )}>
      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </div>
    <span className={cn(
      "text-sm leading-tight",
      isSelected ? "font-medium text-blue-700" : "text-slate-600"
    )}>
      {label}
    </span>
  </div>
);