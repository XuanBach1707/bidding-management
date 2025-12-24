"use client";

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Bot, FileText, Building2, MapPin, Banknote } from 'lucide-react';
import { toast } from '@/shared/lib/hooks/use-toast'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';

import { 
  analyzeBidAi, 
  getBidAnalysisResult,
  // Import thêm type để fix lỗi "implicit any"
  type BidPersonnelReq,
  type BidEquipmentReq
} from '@/entities/bidding';

const AI_QUERY_KEY = (id: number) => ['bid', 'ai-analysis', id];

interface Props {
  hsmtId: number;
}

export const BiddingAiSummary = ({ hsmtId }: Props) => {
  const queryClient = useQueryClient();

  const { data: aiData, isLoading, isError } = useQuery({
    queryKey: AI_QUERY_KEY(hsmtId),
    queryFn: () => getBidAnalysisResult(hsmtId),
    retry: false, 
  });

  const mutation = useMutation({
    mutationFn: () => analyzeBidAi(hsmtId),
    onSuccess: () => {
      toast({ title: "Đang xử lý", description: "AI đang đọc hồ sơ..." });
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEY(hsmtId) });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: AI_QUERY_KEY(hsmtId) });
      }, 5000);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể kích hoạt AI." });
    },
  });

  const formatCurrency = (val?: string | number | null) => {
    if (!val) return '-';
    const numberVal = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numberVal);
  };

  if (isLoading) {
    return <div className="space-y-4 p-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-40 w-full" /></div>;
  }

  // --- LOGIC CHECK DATA ---
  // Lúc này aiData đã đúng kiểu BidAiExtractData, TS sẽ không báo lỗi property does not exist nữa
  const hasData = aiData && (aiData.financial || aiData.generalInfo);

  if (isError || !hasData) {
    return (
      <Card className="border-dashed border-2 bg-slate-50/50">
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-slate-900">Chưa có dữ liệu phân tích</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Nhấn nút bên dưới để AI đọc hồ sơ và trích xuất thông tin.
            </p>
          </div>
          <Button 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            {mutation.isPending ? "Đang xử lý..." : "Phân tích ngay"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Destructuring an toàn
  const { generalInfo, financial, personnel, equipment } = aiData;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <Bot className="w-5 h-5 text-blue-600" /> Kết quả phân tích AI
        </h2>
        <Button variant="outline" size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Phân tích lại"}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 1. INFO CHUNG */}
        {generalInfo && (
          <Card className="xl:col-span-2 border-l-4 border-l-blue-600">
            <CardHeader className="pb-2 border-b bg-slate-50/50">
              <CardTitle className="text-sm font-bold uppercase text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Thông tin chung
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div><span className="text-xs text-slate-500 uppercase font-bold">Tên gói thầu</span><p className="font-medium mt-1">{generalInfo.tenGoiThau}</p></div>
              <div><span className="text-xs text-slate-500 uppercase font-bold">Chủ đầu tư</span><p className="font-medium mt-1">{generalInfo.chuDauTu || "N/A"}</p></div>
              <div><span className="text-xs text-slate-500 uppercase font-bold">Nguồn vốn</span><p className="text-sm mt-1 flex gap-2"><Banknote className="w-4 h-4 text-green-600"/> {generalInfo.chiTietNguonVon}</p></div>
              <div className="grid grid-cols-2 gap-4">
                 <div><span className="text-xs text-slate-500 uppercase font-bold">Địa điểm</span><p className="text-sm mt-1 flex gap-1"><MapPin className="w-3 h-3"/> {generalInfo.diaDiemThucHienGoiThau}</p></div>
                 <div><span className="text-xs text-slate-500 uppercase font-bold">Thời gian</span><p className="text-sm mt-1">{generalInfo.thoiGianThucHienGoiThau}</p></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2. TÀI CHÍNH */}
        {financial && (
          <Card className="flex flex-col">
            <CardHeader className="pb-2 border-b bg-slate-50/30">
              <CardTitle className="text-sm font-bold uppercase text-blue-700 flex items-center gap-2">
                Tài chính & Điều kiện tham gia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <Table>
                <TableBody>
                  {/* Nhóm 1: Thủ tục dự thầu (Hành chính) */}
                  <TableRow className="bg-slate-50/50">
                    <TableCell colSpan={2} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2">
                      Thủ tục & Bảo đảm
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-slate-500 text-sm">Hiệu lực HSDT</TableCell>
                    <TableCell className="text-right font-medium text-sm">{financial.bidValidityDays} ngày</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-slate-500 text-sm">Bảo đảm dự thầu</TableCell>
                    <TableCell className="text-right font-bold text-blue-600 text-sm">{formatCurrency(financial.bidSecurityValue)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-slate-500 text-sm">Hiệu lực Bảo đảm</TableCell>
                    <TableCell className="text-right font-medium text-sm">{financial.bidSecurityDuration} ngày</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-slate-500 text-sm">Phí nộp hồ sơ</TableCell>
                    <TableCell className="text-right font-medium text-sm">{formatCurrency(financial.submissionFee)}</TableCell>
                  </TableRow>

                  {/* Nhóm 2: Năng lực tài chính & Kinh nghiệm */}
                  <TableRow className="bg-slate-50/50">
                    <TableCell colSpan={2} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2">
                      Năng lực & Kinh nghiệm
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-slate-500 text-sm">Doanh thu BQ (3 năm)</TableCell>
                    <TableCell className="text-right font-bold text-red-600 text-sm">{formatCurrency(financial.reqRevenueAvg)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-slate-500 text-sm">Vốn lưu động</TableCell>
                    <TableCell className="text-right font-medium text-sm">{formatCurrency(financial.reqWorkingCapital)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-slate-500 text-sm">HĐ tương tự</TableCell>
                    <TableCell className="text-right font-medium text-sm">
                      {financial.reqSimilarContractQty} gói ≥ {formatCurrency(financial.reqSimilarContractValue)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
      
              {/* Phần mô tả chi tiết HĐ tương tự (Rất quan trọng) */}
              {financial.reqSimilarContractDesc && (
                <div className="p-3 bg-blue-50/50 border-t border-blue-100">
                  <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Chi tiết loại kết cấu HĐ tương tự:</div>
                  <div className="text-xs text-slate-600 leading-relaxed italic">
                    {financial.reqSimilarContractDesc}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
)}

        {/* 3. NHÂN SỰ */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-2 border-b bg-slate-50/30">
            <CardTitle className="text-sm font-bold uppercase text-green-700 flex items-center gap-2">
              Nhân sự ({personnel.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="max-h-[450px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="py-3 text-xs">Vị trí & Kinh nghiệm</TableHead>
                    <TableHead className="text-center w-12 text-xs">SL</TableHead>
                    <TableHead className="text-xs">Yêu cầu bằng cấp / chuyên môn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personnel.map((p: BidPersonnelReq) => (
                    <TableRow key={p.id} className="group hover:bg-slate-50/50">
                      <TableCell className="align-top py-3 min-w-[160px]">
                        <div className="font-bold text-sm text-slate-800">{p.positionName}</div>
                        
                        {/* Hiển thị các mốc kinh nghiệm dưới dạng badge */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.minExpYears && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              KN: ≥ {p.minExpYears} năm
                            </span>
                          )}
                          {p.similarProjectExp && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                              Dự án tương tự: ≥ {p.similarProjectExp}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center font-bold align-top py-3 text-sm">
                        {p.quantity}
                      </TableCell>

                      <TableCell className="text-xs text-slate-600 leading-relaxed py-3">
                        <div className="whitespace-pre-wrap">
                          {p.qualificationReq || "Không có yêu cầu chi tiết"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {personnel.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-slate-400">
                        Không có yêu cầu nhân sự cụ thể
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 4. THIẾT BỊ */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2 border-b bg-slate-50/30">
            <CardTitle className="text-sm font-bold uppercase text-orange-700 flex items-center gap-2">
              Thiết bị ({equipment.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipment.map((e: BidEquipmentReq) => (
                <div 
                  key={e.id} 
                  className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 hover:bg-white hover:shadow-sm transition-all group"
                >
                  {/* Số lượng */}
                  <div className="w-10 h-10 flex flex-col items-center justify-center bg-white border font-bold text-orange-600 rounded-lg shrink-0 shadow-sm">
                    <span className="text-[10px] text-orange-400 font-normal leading-none mb-0.5">SL</span>
                    <span className="leading-none text-sm">{e.quantity}</span>
                  </div>

                  {/* Tên + Spec: Đồng nhất hoàn toàn */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-sm font-medium text-slate-900 break-words line-clamp-2" 
                      title={`${e.equipmentName}${e.specifications ? ` ${e.specifications}` : ''}`}
                    >
                      <span>{e.equipmentName}</span>
                      {e.specifications && (
                        <span> {e.specifications}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {equipment.length === 0 && (
                <div className="col-span-full py-10 text-center border-2 border-dashed rounded-lg bg-slate-50">
                  <p className="text-slate-400 text-sm">Không có yêu cầu thiết bị cụ thể</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};