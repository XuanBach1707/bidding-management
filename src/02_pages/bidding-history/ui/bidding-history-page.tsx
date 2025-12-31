"use client";

import React from "react";
import { DriveBrowser } from "@/features/drive-browser";
import { FolderClock } from "lucide-react"; // Icon trang trí cho header

export const BiddingHistoryPage = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-6 bg-slate-50 space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-slate-800">
          <FolderClock className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Kho dữ liệu thầu</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Truy cập và tra cứu hồ sơ, tài liệu từ các dự án lịch sử (2025 về trước).
        </p>
      </div>

      {/* 2. Main Content (Feature DriveBrowser) */}
      <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Ta bọc div ngoài để control chiều cao cho DriveBrowser nếu cần */}
        <div className="h-full">
          <DriveBrowser />
        </div>
      </div>
    </div>
  );
};