"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, RefreshCw } from "lucide-react";

// Import từ Entities
import { biddingProjectApi, BiddingProject } from "@/entities/bidding-project";

// Import UI nội bộ của Feature này
import { ProjectCard } from "./project-card";

// Import Shared UI
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useToast } from "@/shared/lib/hooks/use-toast";

export const ProjectList = () => {
  const router = useRouter();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<BiddingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await biddingProjectApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast({ 
        variant: "destructive", 
        title: "Lỗi tải dữ liệu", 
        description: "Không thể lấy danh sách dự án. Vui lòng thử lại." 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter Client-side: Tìm theo tên dự án HOẶC mã gói thầu
  const filteredProjects = projects.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchName = p.name.toLowerCase().includes(term);
    const matchPackage = p.packages?.some(pkg => pkg.maTbmt.toLowerCase().includes(term));
    return matchName || matchPackage;
  });

  return (
    <div className="space-y-6">
      
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input 
            placeholder="Tìm kiếm dự án, mã TBMT..." 
            className="pl-10 bg-white border-slate-200 focus-visible:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={fetchProjects} 
          variant="outline" 
          size="sm" 
          className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
        >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới
        </Button>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-600" />
          <p className="text-sm font-medium">Đang đồng bộ dữ liệu...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="text-slate-400 font-medium mb-1">Không tìm thấy dự án nào</div>
          <p className="text-xs text-slate-400 mb-4">
            {searchTerm ? `Không có kết quả cho "${searchTerm}"` : "Danh sách dự án đang trống"}
          </p>
          {searchTerm && (
            <Button variant="link" onClick={() => setSearchTerm("")} className="text-blue-600 h-auto p-0 text-xs">
              Xóa bộ lọc tìm kiếm
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 animate-in fade-in zoom-in-95 duration-300">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onClick={() => router.push(`/bidding-projects/${project.id}`)}
              />
            ))}
          </div>
          
          <div className="text-center text-[11px] text-slate-400 pt-4">
             Hiển thị <b>{filteredProjects.length}</b> / {projects.length} dự án
          </div>
        </div>
      )}
    </div>
  );
};