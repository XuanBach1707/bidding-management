import React from "react";
import { format } from "date-fns";
import { 
  UserCircle, Hash, ExternalLink, Clock, FolderKanban, Calendar
} from "lucide-react";
// [QUAN TRỌNG] Import Type từ Entities
import { BiddingProject } from "@/entities/bidding-project";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

interface ProjectCardProps {
  project: BiddingProject;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  // Lấy gói thầu đầu tiên để hiển thị thông tin (thường là 1-1)
  const mainPackage = project.packages && project.packages.length > 0 ? project.packages[0] : null;

  // Helper chọn màu status
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "bg-green-100 text-green-700 border-green-200";
      case "NEW": return "bg-blue-100 text-blue-700 border-blue-200";
      case "CLOSED": return "bg-slate-100 text-slate-600 border-slate-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <Card 
      onClick={onClick}
      className="group relative overflow-hidden hover:shadow-md transition-all cursor-pointer border-slate-200 bg-white"
    >
      {/* Thanh màu trạng thái bên trái */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", 
        project.status === "ACTIVE" ? "bg-green-500" : 
        project.status === "New" ? "bg-blue-500" : "bg-slate-300"
      )} />

      <div className="p-4 pl-6 flex flex-col md:flex-row gap-6">
        
        {/* CỘT 1: THÔNG TIN DỰ ÁN (INTERNAL) */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ID #{project.id}
            </span>
            <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 border-0 font-bold", getStatusColor(project.status))}>
              {project.status}
            </Badge>
          </div>
          
          <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
            {project.name}
          </h3>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5" title="Leader ID">
              <UserCircle className="h-3.5 w-3.5 text-slate-400" />
              <span>Leader: <b className="text-slate-700">{project.bidTeamLeaderId}</b></span>
            </div>
            <div className="flex items-center gap-1.5" title="Ngày tạo">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{project.createdAt ? format(new Date(project.createdAt), "dd/MM/yyyy") : "N/A"}</span>
            </div>
          </div>
        </div>

        {/* ĐƯỜNG KẺ NGĂN CÁCH */}
        <div className="hidden md:block w-px bg-slate-100 self-stretch mx-2" />

        {/* CỘT 2: THÔNG TIN GÓI THẦU (HSMT) */}
        <div className="flex-1 md:max-w-[45%] bg-slate-50/60 rounded-lg p-3 border border-slate-100/50">
          {mainPackage ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <ExternalLink className="h-3 w-3" />
                  Gói thầu liên kết
                </span>
                <Badge variant="secondary" className="text-[10px] h-5 bg-white border border-slate-200 text-slate-600 shadow-sm">
                  {mainPackage.trangThai}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-blue-600 font-bold">
                  <Hash className="h-3 w-3" />
                  {mainPackage.maTbmt}
                </div>
                <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-relaxed" title={mainPackage.tenGoiThau}>
                  {mainPackage.tenGoiThau}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-[10px] text-slate-400 border-t border-slate-100 mt-1">
                <Calendar className="h-3 w-3" />
                Đăng tải: {mainPackage.ngayDangTai ? format(new Date(mainPackage.ngayDangTai), "dd/MM/yyyy") : "N/A"}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 text-xs italic min-h-[80px]">
              <FolderKanban className="h-6 w-6 mb-1 opacity-50" />
              Chưa liên kết gói thầu
            </div>
          )}
        </div>

      </div>
    </Card>
  );
};