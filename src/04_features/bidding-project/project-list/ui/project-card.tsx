"use client";

import React from "react";
import { format } from "date-fns";
import { 
  UserCircle, Hash, ExternalLink, Clock, FolderKanban, 
  ArrowRight, MapPin, Building2, Timer, Briefcase, CheckSquare 
} from "lucide-react";
import { BiddingProject } from "@/entities/bidding-project";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

import { ResultSummaryBadge } from "./result-summary-badge";

interface ProjectCardProps {
  project: BiddingProject;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const mainPackage = project.packages && project.packages.length > 0 ? project.packages[0] : null;
  const stats = project.stats;

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

  const getBorderColor = (status: string) => {
     switch (status?.toUpperCase()) {
       case "ACTIVE": return "bg-emerald-500";
       case "NEW": return "bg-blue-500";
       case "BIDDING": return "bg-amber-500";
       default: return "bg-slate-300";
     }
  }

  const shouldShowResult = 
    (project.status === 'CLOSED' || project.status === 'COMPLETED') && 
    mainPackage && 
    mainPackage.hsmtId;

  return (
    <Card 
      onClick={onClick}
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 cursor-pointer border-slate-200 bg-white"
    >
      {/* Border trái màu sắc trạng thái */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 transition-colors", getBorderColor(project.status))} />

      {/* Mobile: p-4 pl-5 (Giảm padding để nội dung rộng hơn).
         PC: p-5 pl-7 (Giữ nguyên độ thoáng).
      */}
      <div className="p-4 pl-5 md:p-5 md:pl-7 flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch h-full">
        
        {/* =================================================================================
            CỘT 1: THÔNG TIN DỰ ÁN
           ================================================================================= */}
        <div className="flex-1 flex flex-col justify-between gap-3 md:gap-4">
          
          {/* Header & Info */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between lg:justify-start lg:gap-3">
                <Badge variant="outline" className={cn("text-[10px] h-5 px-2 font-semibold border", getStatusColor(project.status))}>
                {project.status}
                </Badge>
            </div>
            
            <h3 className="text-base md:text-lg font-bold text-slate-800 group-hover:text-[#009d98] transition-colors leading-snug line-clamp-2">
                {project.name}
            </h3>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-100 max-w-full">
                    <UserCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Leader: 
                        <span className="font-semibold text-slate-700 ml-1">
                            {project.bidTeamLeaderName || `ID: ${project.bidTeamLeaderId}`}
                        </span>
                    </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Tạo: <span className="font-medium text-slate-700">{project.createdAt ? format(new Date(project.createdAt), "dd/MM/yyyy") : "N/A"}</span></span>
                </div>
            </div>

            {/* Progress Bar */}
            {!shouldShowResult && stats && stats.totalTasks > 0 && (
                <div className="pt-1 space-y-1 w-full">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                        <span>Tiến độ</span>
                        <span className="text-[#009d98]">{Math.round(stats.progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#009d98]" style={{ width: `${stats.progress}%` }}></div>
                    </div>
                </div>
            )}
          </div>

          {/* Footer (Deadline / Result) */}
          <div className="mt-auto pt-1 md:pt-2">
                {shouldShowResult ? (
                    <ResultSummaryBadge hsmtId={mainPackage?.hsmtId || 0} />
                ) : (
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Deadline Box */}
                        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-md p-2 flex flex-col justify-center group-hover:border-amber-200 transition-colors min-h-[46px]">
                            <span className="text-[9px] uppercase font-bold text-amber-600/70 tracking-wider mb-0.5">Đóng thầu</span>
                            <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                                <Timer className="w-3.5 h-3.5" /> 
                                {mainPackage?.thoiDiemDongThau 
                                    ? format(new Date(mainPackage.thoiDiemDongThau), "HH:mm dd/MM/yyyy") 
                                    : "Chưa cập nhật"}
                            </div>
                        </div>

                        {/* Task Count Box */}
                        {stats && (
                            <div className="shrink-0 h-[46px] bg-slate-50 border border-slate-100 rounded-md px-3 flex flex-col items-center justify-center min-w-[50px]">
                                <CheckSquare className="w-4 h-4 text-slate-400 mb-0.5" />
                                <span className="text-xs font-bold text-slate-700">
                                    {stats.completedTasks}/{stats.totalTasks}
                                </span>
                            </div>
                        )}
                    </div>
                )}
          </div>
        </div>

        {/* Divider (Chỉ hiện trên Desktop) */}
        <div className="hidden lg:block w-px bg-slate-100 self-stretch my-1" />

        {/* =================================================================================
            CỘT 2: THÔNG TIN GÓI THẦU LIÊN KẾT
           ================================================================================= */}
        {/* Mobile: w-full. PC: w-[420px] cố định */}
        <div className="w-full lg:w-[420px] bg-slate-50/50 rounded-lg p-3 md:p-4 border border-slate-100 group-hover:border-[#009d98]/20 group-hover:bg-[#009d98]/5 transition-colors flex flex-col justify-between gap-3">
          {mainPackage ? (
            <>
                <div className="space-y-2 md:space-y-3">
                    {/* Header Gói thầu */}
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        <ExternalLink className="h-3 w-3" />
                        Gói thầu liên kết
                        </span>
                        <div className="flex items-center gap-2">
                             <span className="hidden sm:flex text-[#009d98] cursor-pointer hover:underline text-[10px] font-bold items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                Chi tiết <ArrowRight className="h-3 w-3" />
                            </span>
                            <Badge variant="secondary" className={cn("text-[10px] h-5 px-1.5 shadow-none bg-white", getStatusColor(mainPackage.trangThai))}>
                                {mainPackage.trangThai}
                            </Badge>
                        </div>
                    </div>
                    
                    {/* Mã & Tên */}
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-[#009d98] font-bold mb-1">
                        <Hash className="h-3 w-3" />
                        {mainPackage.maTbmt}
                        </div>
                        <p className="text-xs font-medium text-slate-700 line-clamp-3 leading-relaxed break-words" title={mainPackage.tenGoiThau}>
                        {mainPackage.tenGoiThau}
                        </p>
                    </div>

                    {/* Chi tiết phụ */}
                    <div className="space-y-1.5 border-t border-slate-200/50 pt-2 md:pt-3">
                        {mainPackage.linhVuc && (
                            <div className="flex items-start gap-2 text-xs text-slate-600">
                                <Briefcase className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-500 min-w-[65px]">Lĩnh vực:</span>
                                <span className="font-medium text-slate-800 line-clamp-1">{mainPackage.linhVuc}</span>
                            </div>
                        )}
                        {mainPackage.chuDauTu && (
                            <div className="flex items-start gap-2 text-xs text-slate-600">
                                <Building2 className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-500 min-w-[65px]">Chủ đầu tư:</span>
                                <span className="font-medium text-slate-800 line-clamp-2" title={mainPackage.chuDauTu}>{mainPackage.chuDauTu}</span>
                            </div>
                        )}
                        {mainPackage.diaDiem && (
                            <div className="flex items-start gap-2 text-xs text-slate-600">
                                <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-500 min-w-[65px]">Địa điểm:</span>
                                <span className="font-medium text-slate-800 line-clamp-2" title={mainPackage.diaDiem}>{mainPackage.diaDiem}</span>
                            </div>
                        )}
                    </div>
                </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 text-xs italic min-h-[120px] md:min-h-[150px]">
              <FolderKanban className="h-8 w-8 mb-2 opacity-30" />
              Chưa liên kết gói thầu
            </div>
          )}
        </div>

      </div>
    </Card>
  );
};