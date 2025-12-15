import { BiddingList } from "@/widgets/bidding-list";

export const OpportunitiesPage = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Tra cứu gói thầu
        </h1>
        <p className="text-sm text-slate-500">
          Tìm kiếm và theo dõi các thông tin đấu thầu mới nhất.
        </p>
      </div>
      
      {/* Widget danh sách */}
      <BiddingList />
    </div>
  );
};