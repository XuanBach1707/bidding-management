import { BiddingList } from "@/widgets/bidding-list";

export const OpportunitiesPage = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 1. Header của trang */}
      <div className="flex flex-col gap-2 border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Tra cứu gói thầu
        </h1>
        <p className="text-sm text-slate-500">
          Tìm kiếm và theo dõi các thông tin đấu thầu mới nhất từ hệ thống mạng đấu thầu quốc gia.
        </p>
      </div>
      
      {/* 2. Widget danh sách (Nơi thực hiện gọi API) */}
      {/* Mình bọc thêm div min-h để tránh layout bị giật khi đang load */}
      <div className="min-h-[400px]">
        <BiddingList />
      </div>
    </div>
  );
};