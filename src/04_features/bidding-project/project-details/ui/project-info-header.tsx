"use client";
import { BiddingProject } from "@/entities/bidding-project";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Calendar, User2, Building } from "lucide-react";

export const ProjectInfoHeader = ({ project }: { project: BiddingProject }) => {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 uppercase font-bold text-[10px]">
              {project.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono">Project ID: #{project.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-bold">Chỉnh sửa</Button>
          <Button size="sm" className="bg-blue-600 font-bold shadow-blue-100 shadow-lg">Gửi duyệt</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="p-2 bg-purple-100 rounded-lg"><User2 className="h-4 w-4 text-purple-600" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Team Leader ID</p>
            <p className="text-sm font-bold text-slate-700">{project.bidTeamLeaderId || "Chưa gán"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="p-2 bg-blue-100 rounded-lg"><Building className="h-4 w-4 text-blue-600" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Host ID</p>
            <p className="text-sm font-bold text-slate-700">{project.hostId || "Chưa gán"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="p-2 bg-emerald-100 rounded-lg"><Calendar className="h-4 w-4 text-emerald-600" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Ngày tạo</p>
            <p className="text-sm font-bold text-slate-700">
              {new Date(project.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};