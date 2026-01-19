"use client";

import React from "react";
import { DriveBrowser } from "@/features/drive-browser";
import { FolderClock } from "lucide-react";

export const BiddingHistoryPage = () => {
  return (
    // Mobile: h-[calc(100dvh-64px)] để fix lỗi thanh address bar trên iOS/Android
    // Mobile: p-4. PC: p-6
    <div className="flex flex-col h-[calc(100dvh-64px)] p-4 md:p-6 bg-slate-50 space-y-4 md:space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col gap-1 shrink-0">
        <div className="flex items-center gap-2 text-slate-800">
          <FolderClock className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          {/* Mobile: text-xl. PC: text-2xl */}
          <h1 className="text-xl md:text-2xl font-bold">Kho dữ liệu thầu</h1>
        </div>
        <p className="text-slate-500 text-xs md:text-sm line-clamp-2 md:line-clamp-1">
          Truy cập và tra cứu hồ sơ, tài liệu từ các dự án lịch sử (2025 về trước).
        </p>
      </div>

      {/* 2. Main Content (DriveBrowser) */}
      <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* DriveBrowser cần full height của cha để scroll bên trong */}
        <div className="h-full w-full">
          <DriveBrowser />
        </div>
      </div>
    </div>
  );
};