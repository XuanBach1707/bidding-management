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

  // Render Skeleton Helper
  const renderSkeleton = () => (
    <div className="space-y-8 pt-4">
      <div>
        <Skeleton className="h-4 w-32 mb-4 bg-slate-200" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 rounded-xl bg-slate-100" />)}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-48 mb-2 bg-slate-200" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl bg-white" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* HEADER BLOCK */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Nav Controls */}
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="outline" size="icon" onClick={onBack} className="shrink-0 h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="h-8 w-px bg-slate-200 shrink-0 hidden md:block" />
            <div className="flex items-center gap-2 text-slate-800 font-bold truncate">
               <FolderOpen className="w-5 h-5 text-blue-600 shrink-0" />
               <span className="truncate text-sm md:text-base">{breadcrumbs[breadcrumbs.length - 1].name}</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
            <Input
              placeholder="Tìm kiếm trong dự án..."
              className="pl-9 pr-10 bg-slate-50 border-slate-200"
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
        <div className="flex items-center flex-wrap pt-2 border-t border-slate-100 gap-1">
           <Button variant="ghost" size="sm" onClick={onBack} className="h-7 px-2 text-slate-500 hover:text-blue-600">
             <Home className="w-4 h-4" />
           </Button>
           {breadcrumbs.map((item, index) => {
             const isLast = index === breadcrumbs.length - 1;
             return (
               <div key={item.id} className="flex items-center">
                 <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
                 <Button
                   variant="ghost" size="sm"
                   onClick={() => handleBreadcrumbClick(index, item)}
                   disabled={isLast}
                   className={`h-7 px-2 max-w-[150px] truncate ${isLast ? "font-semibold bg-slate-100 opacity-100" : "text-slate-500 hover:text-blue-600"}`}
                 >
                   {item.name}
                 </Button>
               </div>
             );
           })}
        </div>
      </div>

      {/* CONTENT BLOCK */}
      {isLoading ? renderSkeleton() : (
        <div className="space-y-6">
          {isSearching && (
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                <p className="text-blue-800 text-sm">Kết quả tìm kiếm: <b>"{searchQuery}"</b></p>
                <Button variant="ghost" size="sm" onClick={clearSearch} className="text-blue-600 h-8">Thoát tìm kiếm</Button>
             </div>
          )}

          {!isSearching && <HistoryFolderGrid items={items.filter(i => i.type === "FOLDER")} onFolderClick={handleFolderClick} />}
          
          <HistoryFileList items={isSearching ? items : items.filter(i => i.type !== "FOLDER")} />

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
               <div className="p-4 bg-slate-50 rounded-full"><FileText className="w-8 h-8 text-slate-300" /></div>
               <p className="text-sm">Không có dữ liệu</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};