"use client";

import React, { useEffect, useState, useMemo } from "react";
import { LayoutGrid, Layers, Archive, Loader2 } from "lucide-react";

// Import API & Types
import { biddingProjectApi, BiddingProject } from "@/entities/bidding-project";

// Import Component con
import { ProjectList } from "@/features/bidding-project/project-list";

// Import UI
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";

export const BiddingProjectsListPage = () => {
  const { toast } = useToast();
  
  const [allProjects, setAllProjects] = useState<BiddingProject[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await biddingProjectApi.getAll();
      setAllProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải danh sách dự án." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Phân loại dự án (Logic quan trọng nhất)
  const { inProgressProjects, closedProjects } = useMemo(() => {
    const inProgress: BiddingProject[] = [];
    const closed: BiddingProject[] = [];

    allProjects.forEach((p) => {
        // Nếu không có package -> Tạm tính là dự án mới (In Progress)
        if (!p.packages || p.packages.length === 0) {
            inProgress.push(p);
            return;
        }

        // Kiểm tra xem có gói thầu nào đang chạy không?
        // [QUAN TRỌNG] Dùng 'trangThai' (camelCase) đúng như Type đã sửa
        const hasActivePackage = p.packages.some(pkg => {
            const status = pkg.trangThai?.toUpperCase();
            return ["BIDDING", "NEW", "ACTIVE", "OPEN"].includes(status);
        });

        if (hasActivePackage) {
            inProgress.push(p);
        } else {
            // Nếu tất cả gói thầu đều đã đóng -> Vào lịch sử
            closed.push(p);
        }
    });

    return { inProgressProjects: inProgress, closedProjects: closed };
  }, [allProjects]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto max-w-7xl p-6 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-blue-600" />
            Quản lý Dự án Đấu thầu
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Tổng hợp các dự án thầu đã được khởi tạo. Theo dõi trạng thái và tiến độ thực hiện hồ sơ tại đây.
          </p>
        </div>

        {/* STATS (Số liệu thật) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Card: Đang thực hiện */}
           <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-2 -mt-2 opacity-50"></div>
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 z-10">
                 <Layers className="h-5 w-5" />
              </div>
              <div className="z-10">
                 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Đang thực hiện</div>
                 <div className="text-2xl font-black text-slate-800 mt-1">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : inProgressProjects.length}
                 </div> 
              </div>
           </div>

           {/* Card: Lịch sử */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                 <Archive className="h-5 w-5" />
              </div>
              <div>
                 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Đã đóng thầu</div>
                 <div className="text-2xl font-black text-slate-800 mt-1">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : closedProjects.length}
                 </div> 
              </div>
           </div>
        </div>

        {/* MAIN TABS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[600px]">
           <Tabs defaultValue="in-progress" className="w-full">
              
              <div className="flex justify-between items-center mb-6">
                  <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="in-progress" className="gap-2 px-4">
                        Đang thực hiện 
                        <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-white text-slate-700 shadow-sm">
                            {loading ? "-" : inProgressProjects.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="closed" className="gap-2 px-4">
                        Lịch sử / Đã đóng
                        <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-slate-200 text-slate-600">
                            {loading ? "-" : closedProjects.length}
                        </Badge>
                    </TabsTrigger>
                  </TabsList>
              </div>

              <TabsContent value="in-progress" className="mt-0 focus-visible:ring-0">
                  <ProjectList 
                        initialProjects={inProgressProjects} 
                        isLoading={loading} 
                        onRefresh={fetchProjects}
                        emptyMessage="Không có dự án nào đang thực hiện."
                   />
              </TabsContent>

              <TabsContent value="closed" className="mt-0 focus-visible:ring-0">
                   <ProjectList 
                        initialProjects={closedProjects} 
                        isLoading={loading} 
                        onRefresh={fetchProjects}
                        emptyMessage="Chưa có dự án nào trong lịch sử."
                   />
              </TabsContent>
           </Tabs>
        </div>

      </div>
    </div>
  );
};