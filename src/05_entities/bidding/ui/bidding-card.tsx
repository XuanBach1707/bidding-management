import Link from "next/link"; // 1. Import Link
import { Building2, FileText, Clock } from "lucide-react";
import { BiddingPackage } from "../model/types";

interface BiddingCardProps {
  data: BiddingPackage;
}

export const BiddingCard = ({ data }: BiddingCardProps) => {
  // 2. Tạo đường dẫn chi tiết dựa trên hsmtId
  // Nếu API trả về id là 0 hoặc null thì fallback về trang 404 hoặc list
  const detailUrl = data.hsmtId ? `/opportunities/${data.hsmtId}` : "#";

  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow-md">
      {/* Header: Mã TBMT & Trạng thái */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          Mã TBMT: <span className="text-slate-700">{data.maTbmt}</span>
        </span>
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          Chưa đóng thầu
        </span>
      </div>

      {/* Title - Đã cập nhật thành Link */}
      <Link href={detailUrl} className="block">
        <h3 className="text-lg font-bold text-blue-700 group-hover:underline line-clamp-2">
          {data.tenGoiThau}
        </h3>
      </Link>

      {/* Grid thông tin chi tiết */}
      <div className="grid grid-cols-1 gap-y-2 text-sm text-slate-600 md:grid-cols-2 lg:gap-x-8">
        {/* Cột trái */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>
              <span className="font-semibold text-slate-900">Chủ đầu tư: </span>
              {data.chuDauTu}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" />
            <span>
              <span className="font-semibold text-slate-900">Ngày đăng tải: </span>
              {data.ngayDangTai}
            </span>
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-slate-400" />
            <span>
              <span className="font-semibold text-slate-900">Lĩnh vực: </span>
              {data.linhVuc}
            </span>
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Footer info */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Thời điểm đóng thầu</span>
          <span className="font-bold text-red-600">{data.thoiDiemDongThau}</span>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Hình thức dự thầu</span>
          <span className="font-medium text-slate-900">{data.hinhThucLuaChonNhaThau}</span>
        </div>
      </div>
      
      {/* (Optional) Link phủ toàn bộ Card để click đâu cũng ăn */}
      {/* <Link href={detailUrl} className="absolute inset-0 z-10" aria-label="View detail" /> */}
    </div>
  );
};