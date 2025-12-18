import Link from "next/link";
import { Building2, FileText, Clock, ArrowRight } from "lucide-react";
import { BiddingPackage } from "../model/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

interface BiddingCardProps {
  data: BiddingPackage;
}

export const BiddingCard = ({ data }: BiddingCardProps) => {
  const detailUrl = data.hsmtId ? `/opportunities/${data.hsmtId}` : "#";

  // Helper để hiển thị Badge trạng thái
  const getStatusBadge = () => {
    switch (data.trangThai) {
      case "BIDDING":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Đã duyệt (BIDDING)</Badge>;
      case "NO_GO":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">Bỏ qua (NO GO)</Badge>;
      case "INTERESTED":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0">Quan tâm</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">{data.trangThai || "Mới"}</Badge>;
    }
  };

  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          Mã TBMT: <span className="text-slate-700 font-bold">{data.maTbmt}</span>
        </span>
        {getStatusBadge()}
      </div>

      {/* Title */}
      <Link href={detailUrl} className="block">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 line-clamp-2 transition-colors">
          {data.tenGoiThau}
        </h3>
      </Link>

      {/* Grid info */}
      <div className="grid grid-cols-1 gap-y-2 text-sm text-slate-600 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span className="line-clamp-1">
              <span className="text-slate-500">Chủ đầu tư: </span>
              {data.chuDauTu}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" />
            <span>
              <span className="text-slate-500">Ngày đăng: </span>
              {data.ngayDangTai}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-slate-400" />
            <span>
              <span className="text-slate-500">Lĩnh vực: </span>
              {data.linhVuc}
            </span>
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Footer & Actions */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Hạn đóng thầu</span>
          <span className="font-bold text-red-500">{data.thoiDiemDongThau}</span>
        </div>

        <div className="flex gap-2">
          {/* LÃNH ĐẠO (MANAGER): Chỉ hiện Duyệt khi chưa BIDDING/NO_GO */}
          {data.allowedActions?.includes("APPROVE_BID") && 
           data.trangThai !== "BIDDING" && 
           data.trangThai !== "NO_GO" && (
            <Button size="sm" variant="outline" className="h-8 text-xs border-green-200 text-green-700 hover:bg-green-50" asChild>
              <Link href={detailUrl}>Duyệt ngay</Link>
            </Button>
          )}

          {/* TRƯỞNG PHÒNG (BID_MANAGER): Chỉ hiện Tạo dự án khi đã là BIDDING */}
          {data.allowedActions?.includes("CREATE_PROJECT") && 
           data.trangThai === "BIDDING" && (
            <Button size="sm" className="h-8 text-xs gap-1 shadow-sm" asChild>
              <Link href={detailUrl}>
                Tạo dự án <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          )}

          {/* Fallback: Luôn có nút xem chi tiết nếu không có action khả dụng */}
          {(!data.allowedActions?.includes("APPROVE_BID") || data.trangThai === "BIDDING" || data.trangThai === "NO_GO") && 
           (!data.allowedActions?.includes("CREATE_PROJECT") || data.trangThai !== "BIDDING") && (
            <Button size="sm" variant="ghost" className="h-8 text-xs text-slate-400" asChild>
              <Link href={detailUrl}>Xem chi tiết</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};