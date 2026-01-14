"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, CalendarCheck, Loader2 } from "lucide-react";

// Import từ Entity (theo Index đã chỉnh sửa)
import { biddingResultApi } from "@/entities/bidding-result";
import { formatVND } from "@/shared/lib/format"; 

interface ResultSummaryBadgeProps {
  hsmtId: number;
}

export const ResultSummaryBadge = ({ hsmtId }: ResultSummaryBadgeProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["bidding-result-summary", hsmtId],
    queryFn: () => biddingResultApi.getSummary(hsmtId),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    retry: 1,
  });

  // State: Đang tải
  if (isLoading) {
    return (
        <div className="mt-3 bg-slate-100/50 rounded-lg p-3 flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Đang tải kết quả...</span>
        </div>
    );
  }

  // State: Lỗi hoặc không có dữ liệu
  if (isError || !data) {
      return null; 
  }

  return (
    <div className="mt-3 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-lg p-3 relative overflow-hidden group shadow-sm animate-in fade-in zoom-in-95 duration-300">
      {/* Background Icon trang trí */}
      <div className="absolute right-[-10px] top-[-10px] opacity-[0.08] rotate-12 transition-transform group-hover:rotate-0">
        <Trophy className="w-16 h-16 text-emerald-600" />
      </div>

      {/* Header Badge */}
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-emerald-100 p-1 rounded-full text-emerald-700 flex-shrink-0">
           <Trophy className="w-3 h-3" />
        </div>
        <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest truncate">
          {data.biddingResultText || "KẾT QUẢ LCNT"}
        </span>
      </div>

      {/* Nội dung chính */}
      <div className="space-y-1 pl-0.5 relative z-10">
        <div className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug" title={data.winnerName || "Chưa có tên nhà thầu"}>
            {data.winnerName || "---"}
        </div>
        
        <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50">
                {formatVND(data.winningPrice)}
            </span>
            <div className="flex items-center gap-1 text-slate-400" title="Ngày phê duyệt">
                <CalendarCheck className="w-3 h-3" />
                <span>{data.approvalDate ? new Date(data.approvalDate).toLocaleDateString('vi-VN') : "--/--"}</span>
            </div>
        </div>
      </div>
    </div>
  );
};