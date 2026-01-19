"use client";
import { BiddingList } from "@/widgets/bidding-list";

export const OpportunitiesPage = () => {
  return (
    // Mobile: padding 4 (16px) cho gọn. PC (md trở lên): padding 6 (24px) như cũ.
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* 1. Header của trang */}
      <div className="flex flex-col gap-2 border-b pb-4">
        {/* Mobile: text-xl. PC: text-2xl. Giúp tiêu đề không chiếm quá nhiều chỗ trên màn hình nhỏ. */}
        <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
          Tra cứu gói thầu
        </h1>
        <p className="text-sm text-slate-500">
          Tìm kiếm và theo dõi các thông tin đấu thầu mới nhất từ hệ thống mạng đấu thầu quốc gia.
        </p>
      </div>
      
      {/* 2. Widget danh sách (Nơi thực hiện gọi API) */}
      <div className="min-h-[400px]">
        <BiddingList />
      </div>
    </div>
  );
};