"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, AlertCircle } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { useDebounce } from "@/shared/lib/hooks/use-debounce"; 

import { 
  getBiddingPackages, 
  BiddingCard, 
  BiddingCardSkeleton 
} from "@/entities/bidding";

export const BiddingList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bidding-packages", debouncedSearch],
    queryFn: () => getBiddingPackages({ search: debouncedSearch }),
  });

  const packages = data?.data || [];

  // Sửa lỗi 1 & 2 bằng cách check tồn tại và ép kiểu
  const pending = packages.filter(p => 
    p.trangThai && ["NEW", "INTERESTED"].includes(p.trangThai as string)
  );

  const approved = packages.filter(p => 
    p.trangThai && ["BIDDING", "SUBMITTED", "CLOSED"].includes(p.trangThai as string)
  );

  if (isError) return <div className="text-red-500">Lỗi: {(error as any)?.message}</div>;

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Tìm kiếm gói thầu..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Chờ xử lý ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt ({approved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => <BiddingCardSkeleton key={i} />)
          ) : pending.map(item => (
            <BiddingCard key={item.hsmtId} data={item} />
          ))}
        </TabsContent>

        <TabsContent value="approved" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => <BiddingCardSkeleton key={i} />)
          ) : approved.map(item => (
            <BiddingCard key={item.hsmtId} data={item} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};