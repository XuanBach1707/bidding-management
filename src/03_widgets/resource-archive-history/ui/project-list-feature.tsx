"use client";

import { useState, useEffect, useMemo } from "react";
import { History, Search, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { BiddingHistoryItem, HistoryFilterOptions, resourceApi } from "@/entities/resource";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
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
    <>
      <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="p-2 bg-blue-50 rounded-lg"><History className="w-6 h-6 text-blue-600" /></div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lịch sử năng lực Dự án</h2>
          <p className="text-sm text-slate-500">Dữ liệu hồ sơ thầu và kết quả thực hiện dự án</p>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <aside className="w-72 shrink-0 hidden xl:block sticky top-6">
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

        <div className="flex-1 space-y-4">
          <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Tìm kiếm theo Tên dự án hoặc Mã TBMT..." 
                className="pl-9 border-none shadow-none focus-visible:ring-0 bg-transparent h-9"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(""); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 space-y-4">
              <Skeleton className="h-8 w-1/3 bg-slate-100" />
              <Skeleton className="h-64 w-full bg-slate-50" />
            </div>
          ) : (
            <ArchiveTable projects={paginatedProjects} isLoading={isLoading} onOpenProject={onOpenProject} />
          )}

          {!isLoading && filteredProjects.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500 pl-1">
                Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, filteredProjects.length)}</strong> / <strong>{filteredProjects.length}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium px-2 min-w-[60px] text-center">Trang {currentPage}/{totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};