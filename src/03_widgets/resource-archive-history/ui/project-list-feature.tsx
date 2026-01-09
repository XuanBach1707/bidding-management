"use client";

import { useState, useEffect, useMemo } from "react";
import { History, Search, ChevronLeft, ChevronRight, XCircle, Filter } from "lucide-react";
import { BiddingHistoryItem, HistoryFilterOptions, resourceApi } from "@/entities/resource";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet"; // Dùng Sheet cho Mobile Filter
import { AdvancedFilterSidebar } from "./advanced-filter-sidebar";
import { ArchiveTable } from "./archive-table";

interface ProjectListFeatureProps {
  onOpenProject: (project: BiddingHistoryItem) => void;
}

export const ProjectListFeature = ({ onOpenProject }: ProjectListFeatureProps) => {
  // Data State
  const [projects, setProjects] = useState<BiddingHistoryItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<HistoryFilterOptions>({ years: [], investors: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Init Data
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [pRes, fRes] = await Promise.all([
          resourceApi.getBiddingHistory(),
          resourceApi.getHistoryFilters()
        ]);
        setProjects(pRes.items || []);
        setFilterOptions(fRes || { years: [], investors: [] });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(item => {
      const matchYear = selectedYears.length === 0 || selectedYears.includes(item.nam);
      const matchInvestor = selectedInvestors.length === 0 || selectedInvestors.includes(item.chuDauTu);
      const matchField = selectedFields.length === 0 || (item.linhVuc && selectedFields.includes(item.linhVuc));
      const matchSearch = !searchTerm.trim() || 
        item.tenDuAn.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.maTbmt.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchYear && matchInvestor && matchField && matchSearch;
    });
  }, [projects, selectedYears, selectedInvestors, selectedFields, searchTerm]);

  // Pagination Logic
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  // Reset Handler
  const resetFilters = () => {
    setSelectedYears([]); setSelectedInvestors([]); setSelectedFields([]); setSearchTerm(""); setCurrentPage(1);
  };

  const handleFilterChange = (setter: any) => (val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
         <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#009d98]/10 rounded-xl">
                <History className="w-6 h-6 text-[#009d98]" />
            </div>
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Lịch sử Dự án</h2>
                <p className="text-sm text-slate-500 font-medium">Tra cứu hồ sơ thầu và kết quả thực hiện quá khứ.</p>
            </div>
         </div>
         
         {/* Mobile Filter Trigger */}
         <div className="xl:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2 border-slate-200">
                        <Filter className="w-4 h-4" /> Bộ lọc
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                    <div className="h-full overflow-y-auto p-4">
                        <AdvancedFilterSidebar 
                            options={filterOptions}
                            selectedYears={selectedYears}
                            selectedInvestors={selectedInvestors}
                            selectedFields={selectedFields}
                            onYearChange={handleFilterChange(setSelectedYears)}
                            onInvestorChange={handleFilterChange(setSelectedInvestors)}
                            onFieldChange={handleFilterChange(setSelectedFields)}
                            onReset={resetFilters}
                        />
                    </div>
                </SheetContent>
            </Sheet>
         </div>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* SIDEBAR (Desktop Only) */}
        <aside className="w-[280px] shrink-0 hidden xl:block sticky top-6 self-start">
          <AdvancedFilterSidebar 
            options={filterOptions}
            selectedYears={selectedYears}
            selectedInvestors={selectedInvestors}
            selectedFields={selectedFields}
            onYearChange={handleFilterChange(setSelectedYears)}
            onInvestorChange={handleFilterChange(setSelectedInvestors)}
            onFieldChange={handleFilterChange(setSelectedFields)}
            onReset={resetFilters}
          />
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0 space-y-6">
          
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#009d98] transition-colors" />
            <Input 
              placeholder="Tìm kiếm theo Tên dự án hoặc Mã TBMT..." 
              className="pl-10 h-11 bg-white border-slate-200 shadow-sm focus-visible:ring-[#009d98] text-sm rounded-xl"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(""); setCurrentPage(1); }} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Table Content */}
          <div className="min-h-[400px]">
            {isLoading ? (
                <div className="bg-white p-8 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex justify-between mb-6">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg bg-slate-50" />)}
                </div>
            ) : (
                <ArchiveTable 
                    projects={paginatedProjects} 
                    isLoading={isLoading} 
                    onOpenProject={onOpenProject} 
                />
            )}
          </div>

          {/* Pagination */}
          {!isLoading && filteredProjects.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200/50">
              <div className="text-xs font-medium text-slate-500">
                Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, filteredProjects.length)}</strong> trong tổng số <strong>{filteredProjects.length}</strong> dự án
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 rounded-lg border-slate-200 hover:border-[#009d98] hover:text-[#009d98]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                    {/* Page Numbers (Simple Logic) */}
                    <span className="text-sm font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-md shadow-sm min-w-[32px] text-center">
                        {currentPage}
                    </span>
                    <span className="text-sm text-slate-400 px-1">/</span>
                    <span className="text-sm font-medium text-slate-500 min-w-[20px] text-center">
                        {totalPages}
                    </span>
                </div>

                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 rounded-lg border-slate-200 hover:border-[#009d98] hover:text-[#009d98]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};