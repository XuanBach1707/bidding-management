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
    <div className="flex flex-col h-full space-y-6 max-w-4xl mx-auto">
      {/* Header gọn gàng hơn */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[24px] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Nguồn tri thức hiện có
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Các tập dữ liệu mà Trợ lý AI đang sử dụng để tra cứu
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchData} 
          disabled={loading}
          className="rounded-xl h-11 px-4 border-slate-200 hover:bg-slate-50"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Làm mới
        </Button>
      </div>

      {/* Main Content: Chỉ hiển thị Active Collections */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Danh sách Bộ sưu tập hoạt động
            </h4>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-medium italic">
              AI hiện chưa "học" bộ sưu tập nào.<br/>Vui lòng nạp tài liệu ở tab "Cơ sở dữ liệu".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data?.activeInChroma.map((col) => (
              <div 
                key={col} 
                className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800 dark:text-slate-200 text-lg">
                      {col}
                    </span>
                    <span className="text-xs text-slate-500 font-medium italic">
                      Đang cung cấp ngữ cảnh cho Chatbot
                    </span>
                  </div>
                </div>
                
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/10 border-none px-4 py-1.5 rounded-full gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Sẵn sàng tra cứu
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
            * <strong>Lưu ý:</strong> Chỉ những bộ sưu tập nằm trong danh sách "Sẵn sàng tra cứu" phía trên mới được AI sử dụng để phản hồi các câu hỏi của bạn. Nếu bạn vừa nạp tài liệu mới, vui lòng đợi vài giây và nhấn <strong>Làm mới</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};