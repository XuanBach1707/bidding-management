"use client";

import { useEffect, useState } from "react";
import { 
  getBiddingPackages, 
  BiddingPackage, 
  GetBiddingPackagesParams,
  BiddingCard,
  BiddingCardSkeleton // <-- Import Skeleton
} from "@/entities/bidding";

export const BiddingList = () => {
  const [data, setData] = useState<BiddingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [params, setParams] = useState<GetBiddingPackagesParams>({
    skip: 0,
    limit: 10,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Giả lập delay một chút để nhìn thấy hiệu ứng skeleton (nếu mạng quá nhanh)
        // await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        const res = await getBiddingPackages(params);
        if (res.success) {
            setData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch bidding packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  // LOGIC LOADING MỚI: Render mảng Skeleton
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {/* Render giả 3-5 items */}
        {Array.from({ length: 5 }).map((_, index) => (
          <BiddingCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
        <div className="text-center py-10 text-slate-500 bg-white rounded-lg border border-dashed">
            Không tìm thấy gói thầu nào.
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-semibold text-slate-800">
            Kết quả tìm kiếm ({data.length})
        </h2>
      </div>
      
      <div className="flex flex-col gap-4">
        {data.map((item) => (
          <BiddingCard key={item.hsmtId || item.maTbmt} data={item} />
        ))}
      </div>
    </div>
  );
};