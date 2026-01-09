"use client";

import React from "react";
import { format } from "date-fns";
import { UserCircle, Hash, ExternalLink, Clock, FolderKanban, Calendar, ArrowRight } from "lucide-react";
import { BiddingProject } from "@/entities/bidding-project";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

interface ProjectCardProps {
  project: BiddingProject;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const mainPackage = project.packages && project.packages.length > 0 ? project.packages[0] : null;

  // Helper màu sắc (Enterprise Palette)
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "NEW": return "bg-blue-50 text-blue-700 border-blue-200";
      case "BIDDING": return "bg-amber-50 text-amber-700 border-amber-200"; 
      case "CLOSED": 
      case "COMPLETED": 
        return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // Border trái chỉ thị trạng thái
  const getBorderColor = (status: string) => {
     switch (status?.toUpperCase()) {
        case "ACTIVE": return "bg-emerald-500";
        case "NEW": return "bg-blue-500";
        case "BIDDING": return "bg-amber-500";
        default: return "bg-slate-300";
     }
  }

  return (
    <Card 
      onClick={onClick}
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 cursor-pointer border-slate-200 bg-white"
    >
      {/* Thanh chỉ thị màu bên trái (Mỏng tinh tế) */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 transition-colors", getBorderColor(project.status))} />

      <div className="p-5 pl-7 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* CỘT 1: THÔNG TIN DỰ ÁN (Chiếm phần lớn) */}
        <div className="flex-1 space-y-3 w-full">
          {/* Header nhỏ */}
          <div className="flex items-center justify-between lg:justify-start lg:gap-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
               #{project.id}
            </span>
            <Badge variant="outline" className={cn("text-[10px] h-5 px-2 font-semibold border", getStatusColor(project.status))}>
              {project.status}
            </Badge>
          </div>
          
          {/* Tên dự án */}
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#009d98] transition-colors leading-snug">
            {project.name}
          </h3>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
              <UserCircle className="h-3.5 w-3.5 text-slate-400" />
              <span>Leader: <span className="font-semibold text-slate-700">{project.bidTeamLeaderId}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Tạo ngày: <span className="font-medium text-slate-700">{project.createdAt ? format(new Date(project.createdAt), "dd/MM/yyyy") : "N/A"}</span></span>
            </div>
          </div>
        </div>

        {/* ĐƯỜNG KẺ NGĂN CÁCH (Chỉ hiện trên desktop) */}
        <div className="hidden lg:block w-px bg-slate-100 self-stretch my-1" />

        {/* CỘT 2: THÔNG TIN GÓI THẦU (Box phụ) */}
        <div className="w-full lg:w-[400px] bg-slate-50/50 rounded-lg p-3.5 border border-slate-100 group-hover:border-[#009d98]/20 group-hover:bg-[#009d98]/5 transition-colors">
          {mainPackage ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  <ExternalLink className="h-3 w-3" />
                  Gói thầu liên kết
                </span>
                <Badge variant="secondary" className={cn("text-[10px] h-5 px-1.5 shadow-none bg-white", getStatusColor(mainPackage.trangThai))}>
                  {mainPackage.trangThai}
                </Badge>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#009d98] font-bold mb-1">
                  <Hash className="h-3 w-3" />
                  {mainPackage.maTbmt}
                </div>
                <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-relaxed" title={mainPackage.tenGoiThau}>
                  {mainPackage.tenGoiThau}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/60 mt-1">
                <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {mainPackage.ngayDangTai ? format(new Date(mainPackage.ngayDangTai), "dd/MM/yyyy") : "N/A"}
                </span>
                <span className="text-[#009d98] font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Chi tiết <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 text-xs italic min-h-[90px]">
              <FolderKanban className="h-8 w-8 mb-2 opacity-30" />
              Chưa liên kết gói thầu
            </div>
          )}
        </div>

      </div>
    </Card>
  );
};