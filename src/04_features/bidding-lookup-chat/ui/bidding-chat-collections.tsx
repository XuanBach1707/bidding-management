"use client";

import { useEffect, useState } from 'react';
import { aiBiddingApi, AiCollectionResponse } from '@/entities/ai-bidding';
import { Database, CheckCircle2, RefreshCw, Sparkles, Search } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { Skeleton } from '@/shared/ui/skeleton';

export const BiddingChatCollectionList = () => {
  const [data, setData] = useState<AiCollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await aiBiddingApi.getCollections();
      setData(res);
    } catch (error) {
      console.error("Lỗi lấy danh sách collections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER */}
      {/* Mobile: flex-col gap-4. PC: flex-row gap-0 justify-between */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[24px] border shadow-sm gap-4">
        
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl shrink-0">
            <Database className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Nguồn tri thức hiện có
            </h3>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Các tập dữ liệu mà Trợ lý AI đang sử dụng để tra cứu
            </p>
          </div>
        </div>

        {/* Nút Refresh: Mobile full-width */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchData} 
          disabled={loading}
          className="w-full md:w-auto rounded-xl h-10 md:h-11 px-4 border-slate-200 hover:bg-slate-50"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Làm mới
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] md:rounded-[32px] border border-slate-200 p-4 md:p-8 shadow-sm">
        
        {/* Sub Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 md:h-8 bg-primary rounded-full" />
            <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
              Danh sách Bộ sưu tập hoạt động
            </h4>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-800 w-fit">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider whitespace-nowrap">
              {loading ? "..." : data?.countChroma} Bộ sưu tập sẵn sàng
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : data?.activeInChroma.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 md:w-10 md:h-10 text-slate-200" />
            </div>
            <p className="text-sm md:text-base text-slate-400 font-medium italic px-4">
              AI hiện chưa "học" bộ sưu tập nào.<br/>Vui lòng nạp tài liệu ở tab "Cơ sở dữ liệu".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {data?.activeInChroma.map((col) => (
              <div 
                key={col} 
                // Mobile: flex-col items-start gap-3. PC: flex-row items-center justify-between
                className="group flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 gap-3"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-slate-800 dark:text-slate-200 text-base md:text-lg truncate max-w-[200px] md:max-w-none">
                      {col}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-500 font-medium italic block md:inline">
                      Đang cung cấp ngữ cảnh cho Chatbot
                    </span>
                  </div>
                </div>
                
                <Badge className="w-full md:w-auto justify-center bg-green-500/10 text-green-600 hover:bg-green-500/10 border-none px-3 py-1 md:px-4 md:py-1.5 rounded-full gap-1.5 font-bold text-[10px] md:text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Sẵn sàng tra cứu
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 md:mt-8 p-3 md:p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
          <p className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
            * <strong>Lưu ý:</strong> Chỉ những bộ sưu tập nằm trong danh sách "Sẵn sàng tra cứu" phía trên mới được AI sử dụng để phản hồi các câu hỏi của bạn. Nếu bạn vừa nạp tài liệu mới, vui lòng đợi vài giây và nhấn <strong>Làm mới</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};