"use client";

import { ResourceArchiveHistory } from "@/widgets/resource-archive-history";

export const ResourceHistoryPage = () => {
  return (
    // 1. Root
    <div className="flex flex-col h-full min-h-screen bg-slate-50/50 font-sans">
      
      {/* 2. Container: 
          - Mobile: p-4 (Tiết kiệm đất)
          - Desktop: p-8 (Thoáng đãng)
      */}
      <div className="container mx-auto max-w-7xl p-4 md:p-8 flex-1 flex flex-col min-h-0">
        
        {/* --- MAIN WIDGET AREA --- */}
        {/* Thêm flex-col để đảm bảo con bên trong bung chiều cao đúng ý */}
        <div className="flex-1 min-h-0 relative flex flex-col">
           <ResourceArchiveHistory />
        </div>

      </div>
    </div>
  );
};