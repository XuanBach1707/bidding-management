"use client";

import { useState, useEffect } from "react";
import { Search, ListFilter } from "lucide-react"; 
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button"; 
import { useDebounce } from "@/shared/lib/hooks/use-debounce"; 
import { 
  useBiddingList, 
  BiddingCard, 
  BiddingCardSkeleton 
} from "@/entities/bidding";

const INITIAL_PARAMS = { 
  page: 1, 
  size: 9, 
  status: "NEW,INTERESTED" 
};

export const BiddingList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

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

  const handleTabChange = (value: string) => {
    let statusParam = "";
    if (value === "pending") {
      statusParam = "NEW,INTERESTED"; 
    } else if (value === "approved") {
      statusParam = "BIDDING";
    }
    handleChangeFilter("status", statusParam); 
  };

  if (error) return (
    <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
        <span className="font-bold">Lỗi tải dữ liệu:</span> {error}
    </div>
  );

  return (
    // Mobile: space-y-4 cho gọn. PC: space-y-6 cho thoáng.
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- HEADER CONTROLS --- */}
      {/* Mobile: p-3. PC: p-4. */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm theo Mã TBMT hoặc Tên gói thầu..." 
            className="pl-9 h-10 border-slate-200 focus-visible:ring-[#009d98]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" onValueChange={handleTabChange} className="w-full md:w-auto">
          {/* Grid cols 2 để trên mobile nút bấm to đều, dễ trúng */}
          <TabsList className="bg-slate-100 h-10 p-1 grid grid-cols-2 w-full md:w-auto">
            <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-white data-[state=active]:text-[#009d98] data-[state=active]:shadow-sm text-xs font-semibold px-4 transition-all"
            >
                Chờ xử lý
            </TabsTrigger>
            <TabsTrigger 
                value="approved" 
                className="data-[state=active]:bg-white data-[state=active]:text-[#009d98] data-[state=active]:shadow-sm text-xs font-semibold px-4 transition-all"
            >
                Đã duyệt
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* --- LIST CONTENT --- */}
      {/* Grid tự động scale: 1 cột (mobile) -> 2 cột (tablet) -> 3 cột (PC) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => <BiddingCardSkeleton key={i} />)
        ) : items.length > 0 ? (
          items.map((item) => <BiddingCard key={item.hsmtId} data={item} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <div className="p-4 bg-slate-50 rounded-full mb-3">
                <ListFilter className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold">Không có dữ liệu</h3>
            <p className="text-slate-500 text-sm mt-1">
                Hiện tại không có gói thầu nào ở trạng thái này.
            </p>
          </div>
        )}
      </div>

      {/* --- PAGINATION (Đã tối ưu Mobile) --- */}
      {meta.pages > 1 && (
        // Mobile: flex-col-reverse (Nút bấm lên trên, text xuống dưới).
        // PC: flex-row (ngang).
        <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between py-4 border-t border-slate-200">
          
          {/* Text thông tin: Mobile căn giữa, PC căn trái */}
          <div className="text-xs text-slate-500 font-medium text-center md:text-left">
             Hiển thị {(meta.page - 1) * 9 + 1}-{Math.min(meta.page * 9, meta.total)} trong số {meta.total} gói thầu
          </div>

          {/* Nút điều hướng */}
          <div className="flex justify-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(meta.page - 1)}
              disabled={meta.page === 1 || loading}
              // Thêm w-full trên mobile nếu muốn nút to hết cỡ, hoặc để auto
              className="h-9 px-4 text-xs font-medium hover:bg-slate-50 hover:text-[#009d98] disabled:opacity-50"
            >
              Trước
            </Button>
            
            <div className="flex items-center justify-center min-w-[36px] h-9 bg-[#009d98]/10 text-[#009d98] font-bold text-xs rounded border border-[#009d98]/20">
              {meta.page}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(meta.page + 1)}
              disabled={meta.page >= meta.pages || loading}
              className="h-9 px-4 text-xs font-medium hover:bg-slate-50 hover:text-[#009d98] disabled:opacity-50"
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};