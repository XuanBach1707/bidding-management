"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react"; 
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button"; 
import { useDebounce } from "@/shared/lib/hooks/use-debounce"; 
import { 
  useBiddingList, 
  BiddingCard, 
  BiddingCardSkeleton 
} from "@/entities/bidding";

// 1. [QUAN TRỌNG] Đưa config ra ngoài để giữ nguyên tham chiếu bộ nhớ (Reference Equality)
// Tránh việc hook useBiddingList hiểu lầm là params thay đổi mỗi lần render
const INITIAL_PARAMS = { page: 1, size: 9 };

export const BiddingList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 2. Sử dụng biến constant đã khai báo bên ngoài
  const { 
    items, 
    meta, 
    loading, 
    error,
    changePage, 
    handleSearch, 
    handleChangeFilter 
  } = useBiddingList(INITIAL_PARAMS);

  useEffect(() => {
    handleSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // 3. [SỬA LOGIC] Gửi đa trạng thái khi chọn tab "Chờ xử lý"
  const handleTabChange = (value: string) => {
    let statusParam = "";

    if (value === "pending") {
      // Backend cần hỗ trợ nhận dấu phẩy cho trường hợp này
      statusParam = "NEW,INTERESTED"; 
    } else {
      statusParam = "BIDDING";
    }

    handleChangeFilter("status", statusParam); 
  };

  if (error) return <div className="text-red-500 p-4 border border-red-200 rounded">Lỗi: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Tìm kiếm gói thầu..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
        </TabsList>

        {/* Nội dung danh sách */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {loading ? (
            // Render Skeleton khi đang tải
            Array.from({ length: 9 }).map((_, i) => <BiddingCardSkeleton key={i} />)
          ) : items.length > 0 ? (
            items.map((item) => <BiddingCard key={item.hsmtId} data={item} />)
          ) : (
            <div className="col-span-full py-10 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
              Không tìm thấy gói thầu nào phù hợp.
            </div>
          )}
        </div>
      </Tabs>

      {/* Pagination Controls */}
      {meta.pages > 0 && (
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(meta.page - 1)}
            disabled={meta.page === 1 || loading}
          >
            Trước
          </Button>
          
          <span className="text-sm font-medium">
            Trang {meta.page} / {meta.pages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(meta.page + 1)}
            disabled={meta.page >= meta.pages || loading}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
};