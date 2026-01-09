"use client";

import React, { useEffect, useState, useMemo } from "react";
import { LayoutGrid, Layers, Archive, Loader2, RefreshCcw } from "lucide-react";

// Import API & Types
import { biddingProjectApi, BiddingProject } from "@/entities/bidding-project";

// Import Component con
import { ProjectList } from "@/features/bidding-project/project-list";

// Import UI
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export const BiddingProjectsListPage = () => {
  const { toast } = useToast();
  
  const [allProjects, setAllProjects] = useState<BiddingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch Data
  const fetchProjects = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);
      
      const data = await biddingProjectApi.getAll();
      setAllProjects(data);
      
      if (isManualRefresh) {
          toast({ title: "Đã làm mới dữ liệu", className: "bg-[#009d98] text-white border-none" });
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải danh sách dự án." });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Phân loại dự án
  const { inProgressProjects, closedProjects } = useMemo(() => {
    const inProgress: BiddingProject[] = [];
    const closed: BiddingProject[] = [];

    allProjects.forEach((p) => {
        if (!p.packages || p.packages.length === 0) {
            inProgress.push(p);
            return;
        }
        const hasActivePackage = p.packages.some(pkg => {
            const status = pkg.trangThai?.toUpperCase();
            return ["BIDDING", "NEW", "ACTIVE", "OPEN"].includes(status);
        });

        if (hasActivePackage) {
            inProgress.push(p);
        } else {
            closed.push(p);
        }
    });

    return { inProgressProjects: inProgress, closedProjects: closed };
  }, [allProjects]);

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="container mx-auto max-w-6xl py-8 px-4 space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-[#009d98]/10 rounded-lg">
                        <LayoutGrid className="h-6 w-6 text-[#009d98]" />
                    </div>
                    Quản lý Dự án
                </h1>
                <p className="text-sm text-slate-500 ml-[52px]">
                    Theo dõi tiến độ thực hiện hồ sơ thầu tập trung.
                </p>
            </div>
            
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchProjects(true)} 
                disabled={loading || isRefreshing}
                className="gap-2 bg-white text-slate-600 border-slate-200 hover:text-[#009d98] hover:border-[#009d98]"
            >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Đang tải..." : "Làm mới dữ liệu"}
            </Button>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Card 1: Active */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden group hover:border-[#009d98]/50 transition-colors">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-[#009d98]/10 to-transparent -mr-6 -mt-6 rounded-full blur-xl group-hover:from-[#009d98]/20 transition-all"></div>
              
              <div className="h-12 w-12 rounded-lg bg-[#009d98]/10 flex items-center justify-center text-[#009d98]">
                 <Layers className="h-6 w-6" />
              </div>
              <div className="z-10">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Đang thực hiện</div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-800 tabular-nums">
                        {loading ? "-" : inProgressProjects.length}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">dự án</span>
                 </div>
              </div>
           </div>

           {/* Card 2: Closed */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden hover:border-slate-300 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                 <Archive className="h-6 w-6" />
              </div>
              <div>
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Lịch sử / Đóng thầu</div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-800 tabular-nums">
                        {loading ? "-" : closedProjects.length}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">dự án</span>
                 </div>
              </div>
           </div>
        </div>

        {/* CONTENT TABS */}
        <div className="space-y-6">
           <Tabs defaultValue="in-progress" className="w-full">
              
              <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm pb-4 pt-2">
                  <TabsList className="bg-white border border-slate-200 h-11 p-1 w-full sm:w-auto shadow-sm">
                    <TabsTrigger value="in-progress" className="gap-2 px-6 h-9 font-semibold data-[state=active]:bg-[#009d98] data-[state=active]:text-white transition-all">
                        Đang thực hiện 
                        <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-slate-100 text-slate-600 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white ml-1">
                            {inProgressProjects.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="closed" className="gap-2 px-6 h-9 font-semibold data-[state=active]:bg-slate-700 data-[state=active]:text-white transition-all">
                        Lịch sử
                        <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-slate-100 text-slate-600 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white ml-1">
                            {closedProjects.length}
                        </Badge>
                    </TabsTrigger>
                  </TabsList>
              </div>

              <TabsContent value="in-progress" className="mt-0 focus-visible:outline-none">
                  <ProjectList 
                        initialProjects={inProgressProjects} 
                        isLoading={loading} 
                        onRefresh={() => fetchProjects(true)}
                        emptyMessage="Hiện tại không có dự án nào đang chạy."
                   />
              </TabsContent>

              <TabsContent value="closed" className="mt-0 focus-visible:outline-none">
                   <ProjectList 
                        initialProjects={closedProjects} 
                        isLoading={loading} 
                        onRefresh={() => fetchProjects(true)}
                        emptyMessage="Chưa có dự án nào trong lịch sử lưu trữ."
                   />
              </TabsContent>
           </Tabs>
        </div>

      </div>
    </div>
  );
};