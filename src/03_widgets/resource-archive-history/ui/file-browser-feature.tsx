"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, Search, ChevronRight, Home, FolderOpen, FileText, XCircle, Loader2 
} from "lucide-react";
import { ResourceItem, resourceApi } from "@/entities/resource";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { HistoryFolderGrid } from "./history-folder-grid";
import { HistoryFileList } from "./history-file-list";

interface FileBrowserFeatureProps {
  rootFolderId: string;
  rootProjectName: string;
  onBack: () => void;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

export const FileBrowserFeature = ({ rootFolderId, rootProjectName, onBack }: FileBrowserFeatureProps) => {
  // State
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Navigation
  const [currentFolderId, setCurrentFolderId] = useState<string>(rootFolderId);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: rootFolderId, name: rootProjectName }
  ]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Effect: Fetch Data
  useEffect(() => {
    if (!isSearching && currentFolderId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const res = await resourceApi.getFolderContent(currentFolderId);
          setItems(res.data || []);
        } catch (error) {
          console.error(error);
          setItems([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [currentFolderId, isSearching]);

  // Handlers
  const handleFolderClick = (folder: ResourceItem) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    setSearchQuery("");
    setIsSearching(false);
  };

  const handleBreadcrumbClick = (index: number, item: BreadcrumbItem) => {
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    setCurrentFolderId(item.id);
    setSearchQuery("");
    setIsSearching(false);
  };

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!searchQuery.trim()) {
        setIsSearching(false);
        return;
      }
      setIsLoading(true);
      setIsSearching(true);
      try {
        const res = await resourceApi.searchResources(searchQuery, rootFolderId);
        setItems(res);
      } catch (e) {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
  };

  // Render Skeleton
  const renderSkeleton = () => (
    <div className="space-y-8 pt-4 animate-pulse">
      <div>
        <div className="h-4 w-32 mb-4 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-24 rounded-xl bg-slate-100" />)}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-48 mb-2 bg-slate-200 rounded" />
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-white border border-slate-100" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
      
      {/* HEADER BLOCK */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 sticky top-0 z-10 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Nav Controls */}
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="outline" size="icon" onClick={onBack} className="shrink-0 h-9 w-9 border-slate-200 text-slate-500 hover:text-[#009d98] hover:border-[#009d98]">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="h-6 w-px bg-slate-200 shrink-0 hidden md:block" />
            <div className="flex items-center gap-2 text-slate-800 font-bold truncate">
               <FolderOpen className="w-5 h-5 text-[#009d98] shrink-0" />
               <span className="truncate text-sm md:text-base max-w-[200px] md:max-w-[400px]" title={breadcrumbs[breadcrumbs.length - 1].name}>
                 {breadcrumbs[breadcrumbs.length - 1].name}
               </span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#009d98]" />
            <Input
              placeholder="Tìm kiếm trong dự án..."
              className="pl-9 pr-10 bg-slate-50 border-slate-200 h-9 focus-visible:ring-[#009d98]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center flex-wrap pt-2 border-t border-slate-100 gap-1 text-sm">
           <Button variant="ghost" size="sm" onClick={onBack} className="h-6 px-1.5 text-slate-400 hover:text-[#009d98]">
             <Home className="w-3.5 h-3.5" />
           </Button>
           {breadcrumbs.map((item, index) => {
             const isLast = index === breadcrumbs.length - 1;
             return (
               <div key={item.id} className="flex items-center">
                 <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-0.5" />
                 <Button
                   variant="ghost" size="sm"
                   onClick={() => handleBreadcrumbClick(index, item)}
                   disabled={isLast}
                   className={`h-6 px-2 max-w-[120px] truncate text-xs ${
                      isLast 
                      ? "font-bold bg-slate-100 text-slate-800 opacity-100 pointer-events-none" 
                      : "text-slate-500 hover:text-[#009d98] hover:bg-[#009d98]/5"
                   }`}
                   title={item.name}
                 >
                   {item.name}
                 </Button>
               </div>
             );
           })}
        </div>
      </div>

      {/* CONTENT BLOCK */}
      <div className="flex-1 overflow-auto bg-slate-50/50 rounded-xl p-1 md:p-0 min-h-0">
        {isLoading ? renderSkeleton() : (
          <div className="space-y-6 pb-10">
            
            {/* Search Result Banner */}
            {isSearching && (
               <div className="bg-[#009d98]/5 p-4 rounded-lg border border-[#009d98]/20 flex justify-between items-center mb-4">
                  <p className="text-[#009d98] text-sm font-medium">Kết quả tìm kiếm: <b>"{searchQuery}"</b></p>
                  <Button variant="ghost" size="sm" onClick={clearSearch} className="text-[#009d98] hover:bg-[#009d98]/10 h-8 text-xs">Thoát tìm kiếm</Button>
               </div>
            )}

            {/* Folders */}
            {!isSearching && items.some(i => i.type === "FOLDER") && (
                <HistoryFolderGrid items={items.filter(i => i.type === "FOLDER")} onFolderClick={handleFolderClick} />
            )}
            
            {/* Files */}
            <HistoryFileList items={isSearching ? items : items.filter(i => i.type !== "FOLDER")} />

            {/* Empty State */}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3 h-64">
                 <div className="p-4 bg-slate-100 rounded-full"><FileText className="w-8 h-8 text-slate-300" /></div>
                 <p className="text-sm">Không tìm thấy dữ liệu nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};