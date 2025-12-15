"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react"; // Icon cảnh báo lỗi

import { 
  getBiddingPackages, 
  BiddingCard, 
  BiddingCardSkeleton 
} from "@/entities/bidding";

export const BiddingList = () => {
  // 1. Gọi API lấy dữ liệu
  // staleTime: 1 phút (trong 1 phút nếu user quay lại sẽ không gọi API mới để đỡ tốn tài nguyên)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bidding-packages"],
    queryFn: () => getBiddingPackages({ skip: 0, limit: 10 }),
    staleTime: 60 * 1000, 
  });

  // 2. Trạng thái Đang Tải (Loading)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Render 6 khung xương giả lập loading */}
        {Array.from({ length: 6 }).map((_, index) => (
          <BiddingCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 3. Trạng thái Lỗi (Error)
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
        <p className="text-sm font-medium text-red-800">
          Không thể tải danh sách gói thầu.
        </p>
        <p className="text-xs text-red-600 mt-1">
          {error instanceof Error ? error.message : "Lỗi không xác định"}
        </p>
      </div>
    );
  }

  // 4. Lấy mảng dữ liệu an toàn
  // data?.data vì cấu trúc trả về là { success: true, data: [...] }
  const packages = data?.data || [];

  // 5. Trạng thái Rỗng (Empty)
  if (packages.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
        <p className="text-sm text-slate-500">Chưa tìm thấy gói thầu nào.</p>
      </div>
    );
  }

  // 6. Trạng thái Có dữ liệu -> Render danh sách
  return (
    <div className="flex flex-col gap-4">
      {/* (Tùy chọn) Hiển thị số lượng kết quả */}
      <div className="flex items-center justify-between">
         <p className="text-sm font-medium text-slate-500">
            Hiển thị {packages.length} kết quả mới nhất
         </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((item) => (
          <BiddingCard 
            // Dùng hsmtId làm key là chuẩn nhất theo API
            key={item.hsmtId} 
            data={item} 
          />
        ))}
      </div>
    </div>
  );
};