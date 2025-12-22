"use client";

import React from "react";
import { LayoutGrid, Layers, Archive } from "lucide-react";

// Import Feature danh sách từ layer Features
import { ProjectList } from "@/features/bidding-project/project-list";

// Export tên Component rõ ràng để tránh nhầm lẫn với "page" của Next.js
export const BiddingProjectsListPage = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto max-w-7xl p-6 space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-blue-600" />
            Danh sách Dự án Đang thực hiện
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Tổng hợp các dự án thầu đã được khởi tạo. Theo dõi trạng thái và tiến độ thực hiện hồ sơ tại đây.
          </p>
        </div>

        {/* STATS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Card 1 */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                 <Layers className="h-5 w-5" />
              </div>
              <div>
                 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Đang thực hiện</div>
                 <div className="text-lg font-bold text-slate-800">--</div> 
              </div>
           </div>

           {/* Card 2 */}
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                 <Archive className="h-5 w-5" />
              </div>
              <div>
                 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Đã đóng thầu</div>
                 <div className="text-lg font-bold text-slate-800">--</div> 
              </div>
           </div>
        </div>

        {/* MAIN CONTENT: PROJECT LIST */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[600px]">
           <ProjectList />
        </div>

      </div>
    </div>
  );
};