"use client";

import Link from "next/link";
import { Building2, FileText, CalendarDays, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { BiddingPackage } from "../model/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface BiddingCardProps {
  data: BiddingPackage;
}

export const BiddingCard = ({ data }: BiddingCardProps) => {
  const detailUrl = data.hsmtId ? `/opportunities/${data.hsmtId}` : "#";
  const projectUrl = data.projectId ? `/bidding-projects/${data.projectId}` : "#";

  // Giữ nguyên logic màu Badge của bạn
  const getStatusBadge = () => {
    // Thêm whitespace-nowrap để Badge không bị ngắt dòng xấu trên mobile
    const baseClasses = "whitespace-nowrap"; 
    switch (data.trangThai) {
      case "BIDDING":
        return <Badge className={`${baseClasses} bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 font-semibold`}>Đã duyệt (BIDDING)</Badge>;
      case "NO_GO":
        return <Badge className={`${baseClasses} bg-slate-100 text-slate-500 hover:bg-slate-100 border-slate-200`}>Bỏ qua (NO GO)</Badge>;
      case "INTERESTED":
        return <Badge className={`${baseClasses} bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-100 font-semibold`}>Quan tâm</Badge>;
      case "NEW":
        return <Badge className={`${baseClasses} bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 font-semibold`}>Mới</Badge>;
      default:
        return <Badge variant="outline" className={`${baseClasses} text-slate-600`}>{data.trangThai || "Unknown"}</Badge>;
    }
  };

  return (
    <div className={cn(
      "group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300",
      // Hover effects
      "hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#009d98]/30 hover:-translate-y-1",
      // Mobile: p-4 cho rộng rãi nội dung. PC: p-5 như cũ.
      "p-4 md:p-5"
    )}>
      
      <div>
        {/* HEADER: Mã + Trạng thái */}
        {/* Mobile: gap-2. Dùng flex-wrap để nếu màn hình quá bé, badge rớt xuống dòng chứ không đè mã */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                {data.maTbmt}
                </span>
                {data.projectId && (
                    <Badge className="bg-[#009d98]/10 text-[#009d98] hover:bg-[#009d98]/10 border-0 h-5 px-1.5 gap-1 text-[10px] whitespace-nowrap">
                        <CheckCircle2 className="h-3 w-3" /> Dự án
                    </Badge>
                )}
            </div>
            {getStatusBadge()}
        </div>

        {/* TITLE */}
        <Link href={detailUrl} className="block mb-4">
            <h3 
              className="text-base font-bold text-slate-800 group-hover:text-[#009d98] leading-snug line-clamp-2 transition-colors" 
              title={data.tenGoiThau}
            >
            {data.tenGoiThau}
            </h3>
        </Link>

        {/* INFO GRID */}
        {/* Mobile: space-y-3 để dễ đọc hơn chút. */}
        <div className="space-y-3 mb-5">
            <div className="flex items-start gap-2.5 text-sm text-slate-600">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span className="line-clamp-2 leading-relaxed break-words">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Chủ đầu tư</span>
                    {data.chuDauTu || "Chưa cập nhật"}
                </span>
            </div>
            
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">
                    <span className="text-slate-400 font-normal mr-1">Lĩnh vực:</span>
                    <span className="font-medium text-slate-700">{data.linhVuc || "Khác"}</span>
                </span>
            </div>
        </div>
      </div>

      {/* FOOTER: Hạn đóng thầu + Action */}
      {/* Mobile: pt-3. PC: pt-4. border-t */}
      <div className="mt-auto pt-3 md:pt-4 border-t border-slate-50">
         {/* Mobile trick: Sử dụng flex-wrap.
            Nếu màn hình đủ rộng: Date bên trái, Button bên phải (như cũ).
            Nếu màn hình hẹp: Button sẽ tự rớt xuống dòng, không bị đè.
         */}
         <div className="flex flex-wrap items-end justify-between gap-3">
             {/* Deadline */}
             <div className="flex flex-col min-w-[100px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> Hạn mở thầu
                </span>
                <span className={cn(
                    "text-sm font-bold tabular-nums mt-0.5 whitespace-nowrap",
                    "text-slate-800" 
                )}>
                    {data.thoiDiemMoThau || "Chưa có"}
                </span>
             </div>

             {/* ACTIONS */}
             {/* Mobile: ml-auto để nút luôn dính về bên phải, kể cả khi rớt dòng */}
             <div className="flex gap-2 ml-auto">
                {data.projectId ? (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-slate-200 text-slate-600 hover:text-[#009d98] hover:border-[#009d98] active:scale-95 transition-transform" asChild>
                        <Link href={projectUrl}>
                            Dự án <ExternalLink className="h-3 w-3" />
                        </Link>
                    </Button>
                ) : (
                    <>
                        {(data.allowedActions?.includes("APPROVE_BID") || data.allowedActions?.includes("CREATE_PROJECT")) && 
                        data.trangThai !== "NO_GO" && (
                            <Button size="sm" className="h-8 text-xs gap-1.5 bg-[#009d98] hover:bg-[#008580] shadow-sm text-white border-0 active:scale-95 transition-transform" asChild>
                                <Link href={detailUrl}>
                                    Xử lý <ArrowRight className="h-3 w-3" />
                                </Link>
                            </Button>
                        )}
                        
                        {(!data.allowedActions?.length || data.trangThai === "NO_GO") && (
                             <Button size="sm" variant="ghost" className="h-8 text-xs text-slate-400 hover:text-slate-600 active:scale-95 transition-transform" asChild>
                                <Link href={detailUrl}>Xem chi tiết</Link>
                             </Button>
                        )}
                    </>
                )}
             </div>
         </div>
      </div>
    </div>
  );
};