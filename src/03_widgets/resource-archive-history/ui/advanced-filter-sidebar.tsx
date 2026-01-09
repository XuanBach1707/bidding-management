"use client";

import { useState } from "react";
import { Filter, RotateCcw, ChevronDown, ChevronRight, Check, Briefcase, Calendar, Building2 } from "lucide-react";
import { HistoryFilterOptions } from "@/entities/resource";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button"; 

// Fix cứng 3 loại lĩnh vực
const FIELD_OPTIONS = ["Xây lắp", "Hàng hóa", "Hỗn hợp"];

interface AdvancedFilterSidebarProps {
  options: HistoryFilterOptions;
  
  // State Filter
  selectedYears: number[];
  selectedInvestors: string[];
  selectedFields: string[]; 

  // Handlers
  onYearChange: (years: number[]) => void;
  onInvestorChange: (investors: string[]) => void;
  onFieldChange: (fields: string[]) => void; 
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

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    years: true,
    fields: true,
    investors: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleItem = <T,>(item: T, current: T[], onChange: (items: T[]) => void) => {
    if (current.includes(item)) {
      onChange(current.filter(i => i !== item));
    } else {
      onChange([...current, item]);
    }
  };

  const hasFilters = selectedYears.length > 0 || selectedInvestors.length > 0 || selectedFields.length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-6 overflow-hidden w-full lg:w-[280px] shrink-0">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2 text-slate-800">
          <Filter className="w-4 h-4 text-[#009d98]" />
          <span className="font-bold text-sm uppercase tracking-wide">Bộ lọc</span>
        </div>
        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="h-7 px-2 text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Xóa
          </Button>
        )}
      </div>

      <div className="p-3 space-y-2">
        
        {/* SECTION 1: LĨNH VỰC */}
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
          <div className="grid grid-cols-3 gap-1.5">
            {options?.years?.map((y) => (
               <div 
                 key={y}
                 onClick={() => toggleItem(y, selectedYears, onYearChange)}
                 className={cn(
                   "text-center py-1.5 rounded text-xs font-semibold cursor-pointer transition-all border",
                   selectedYears.includes(y)
                     ? "bg-[#009d98] text-white border-[#009d98] shadow-sm"
                     : "bg-white text-slate-600 border-slate-200 hover:border-[#009d98] hover:text-[#009d98]"
                 )}
               >
                 {y}
               </div>
            ))}
          </div>
        </FilterSection>

        {/* SECTION 3: CHỦ ĐẦU TƯ */}
        <FilterSection 
          title="Chủ đầu tư" 
          icon={<Building2 className="w-3.5 h-3.5" />}
          isOpen={openSections.investors} 
          onToggle={() => toggleSection('investors')}
          count={selectedInvestors.length}
        >
          {/* Custom Scrollbar cho danh sách dài */}
          <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
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

// --- SUB COMPONENTS ---

const FilterSection = ({ title, icon, isOpen, onToggle, children, count }: any) => (
  <div className="border border-slate-100 rounded-lg overflow-hidden bg-white shadow-sm">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors select-none"
    >
      <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
        <span className="text-slate-400">{icon}</span>
        {title}
        {count > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#009d98] text-white text-[10px] font-bold">
            {count}
          </span>
        )}
      </div>
      {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
    </button>
    
    {isOpen && (
      <div className="p-3 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-1 duration-200">
        {children}
      </div>
    )}
  </div>
);

const FilterItem = ({ label, isSelected, onClick }: any) => (
  <div 
    onClick={onClick}
    className={cn(
      "flex items-start gap-2.5 p-2 rounded cursor-pointer transition-all group select-none",
      isSelected ? "bg-[#009d98]/10" : "hover:bg-slate-100"
    )}
  >
    <div className={cn(
      "w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors shrink-0",
      isSelected 
        ? "bg-[#009d98] border-[#009d98]" 
        : "bg-white border-slate-300 group-hover:border-[#009d98]"
    )}>
      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </div>
    <span className={cn(
      "text-xs leading-tight font-medium",
      isSelected ? "text-[#009d98]" : "text-slate-600"
    )}>
      {label}
    </span>
  </div>
);