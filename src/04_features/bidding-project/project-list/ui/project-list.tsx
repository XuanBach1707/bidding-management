"use client";

import React, { useState } from "react"; 
import { useRouter } from "next/navigation";
import { Loader2, Search, RefreshCw } from "lucide-react";

import { BiddingProject } from "@/entities/bidding-project";
import { ProjectCard } from "./project-card"; // Component Card bên dưới
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface ProjectListProps {
  initialProjects: BiddingProject[];
  isLoading: boolean;
  onRefresh: () => void;
  emptyMessage?: string;
}

export const ProjectList = ({ 
  initialProjects, 
  isLoading, 
  onRefresh, 
  emptyMessage = "Danh sách dự án đang trống"
}: ProjectListProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = initialProjects.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchName = p.name.toLowerCase().includes(term);
    // [FIX] Dùng maTbmt (camelCase)
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
        
        <Button onClick={onRefresh} variant="outline" size="sm" className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
        </Button>
      </div>

      {/* LIST CONTENT */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-600" />
          <p className="text-sm font-medium">Đang đồng bộ dữ liệu...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="text-slate-400 font-medium mb-1">
             {searchTerm ? "Không tìm thấy kết quả phù hợp" : "Danh sách trống"}
          </div>
          <p className="text-xs text-slate-400 mb-4">
            {searchTerm ? `Không có dự án nào khớp với "${searchTerm}"` : emptyMessage}
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
              Hiển thị <b>{filteredProjects.length}</b> / {initialProjects.length} dự án
          </div>
        </div>
      )}
    </div>
  );
};