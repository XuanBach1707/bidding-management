"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Bot, Activity, FolderOpen } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns"; 

// UI Components
import { Button } from "@/shared/ui/button"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; 
import { Skeleton } from "@/shared/ui/skeleton";
import { Badge } from "@/shared/ui/badge"; 

// Entities & Types
import { 
  getBiddingPackageDetail, 
  getBiddingPackageFiles, 
  BiddingPackage, 
  BiddingFile 
} from "@/entities/bidding";

interface Props {
  id: string;
}

export const OpportunityDetailPage = ({ id }: Props) => {
  const [data, setData] = useState<BiddingPackage | null>(null);
  const [files, setFiles] = useState<BiddingFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi song song 2 API để tối ưu tốc độ
        const [detailRes, fileRes] = await Promise.all([
          getBiddingPackageDetail(id),
          getBiddingPackageFiles(id)
        ]);

        // --- SỬA ĐOẠN NÀY ---
        if (detailRes.success && detailRes.data) {
          // Kiểm tra xem data có phải là mảng không
          if (Array.isArray(detailRes.data)) {
            if (detailRes.data.length > 0) {
              // QUAN TRỌNG: Lấy phần tử đầu tiên [0]
              setData(detailRes.data[0]); 
            } else {
              console.warn("API trả về mảng rỗng");
            }
          } else {
            // Dự phòng: Nếu API đổi ý trả về Object thì vẫn nhận
            setData(detailRes.data as any);
          }
        }
        
        if (fileRes.success) {
          setFiles(fileRes.data);
        }
      } catch (error) {
        console.error("Lỗi tải trang chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!data) return <div className="p-6 text-red-500">Không tìm thấy thông tin gói thầu.</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="bg-white px-6 py-4 border-b sticky top-0 z-10 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Link href="/opportunities" className="flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại danh sách
          </Link>
          
          {/* SỬA: Thêm fallback || "--" cho Badge mã gói thầu */}
          <Badge variant="outline" className="bg-slate-100 text-slate-600 font-normal">
            {data.maTbmt || "--"}
          </Badge>
          
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
            {data.trangThai || "Dự thảo"}
          </Badge>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* SỬA: Thêm fallback cho tên gói thầu */}
          <h1 className="text-xl font-bold text-slate-900 max-w-4xl leading-relaxed">
            {data.tenGoiThau || "Đang cập nhật tên gói thầu..."}
          </h1>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline">Phê duyệt / Quyết định</Button>
            <Button>Khởi tạo Dự án</Button>
          </div>
        </div>
      </div>

      {/* --- TABS & CONTENT --- */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-white border mb-4 w-full justify-start h-auto p-1 overflow-x-auto">
            <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-slate-100 py-2">
              <FileText className="h-4 w-4" /> Thông tin chung
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2 py-2">
              <Bot className="h-4 w-4" /> Tóm tắt (AI)
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2 py-2">
              <Activity className="h-4 w-4" /> Health Check
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2 py-2">
              <FolderOpen className="h-4 w-4" /> Hồ sơ gốc <Badge variant="secondary" className="ml-1 h-5 px-1.5">{files.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: THÔNG TIN CHUNG (FULL FIELDS) */}
          <TabsContent value="general" className="space-y-6">
            
            {/* 1. THÔNG TIN CƠ BẢN */}
            <SectionCard title="Thông tin cơ bản">
              <InfoRow label="Mã TBMT" value={data.maTbmt} />
              <InfoRow label="Ngày đăng tải" value={formatDate(data.ngayDangTai)} />
              <InfoRow label="Phiên bản thay đổi" value={data.phienBanThayDoi} />
              <InfoRow label="Trạng thái" value={data.trangThai} />
              <InfoRow label="Link gốc" value="Xem tại muasamcong" isLink /> 
              {/* Lưu ý: Bạn có thể dùng data.duongDanGoiThau cho link gốc nếu muốn */}
            </SectionCard>

            {/* 2. KẾ HOẠCH LỰA CHỌN NHÀ THẦU */}
            <SectionCard title="Thông tin KHLCNT & Dự án">
              <InfoRow label="Mã KHLCNT" value={data.maKhlcnt} isLink />
              <InfoRow label="Phân loại KHLCNT" value={data.phanLoaiKhlcnt} />
              <InfoRow label="Tên dự toán/Dự án" value={data.tenDuAn} fullWidth />
              <InfoRow label="Chi tiết nguồn vốn" value={data.chiTietNguonVon} fullWidth />
            </SectionCard>

            {/* 3. CHI TIẾT GÓI THẦU */}
            <SectionCard title="Thông tin chi tiết gói thầu">
              <InfoRow label="Tên gói thầu" value={data.tenGoiThau} fullWidth />
              <InfoRow label="Chủ đầu tư" value={data.chuDauTu} fullWidth />
              <InfoRow label="Lĩnh vực" value={data.linhVuc} />
              <InfoRow label="Loại công trình" value={data.loaiCongTrinh} />
              
              <InfoRow label="Hình thức LCNT" value={data.hinhThucLuaChonNhaThau} />
              <InfoRow label="Phương thức LCNT" value={data.phuongThucLuaChonNhaThau} />
              
              <InfoRow label="Loại hợp đồng" value={data.loaiHopDong} />
              <InfoRow label="Trong nước/Quốc tế" value={data.trongNuocHoacQuocTe} />
              
              <InfoRow label="Quy trình áp dụng" value={data.quyTrinhApDung} fullWidth />
              <InfoRow label="Địa điểm thực hiện" value={data.diaDiemThucHienGoiThau} fullWidth />
              <InfoRow label="Thời gian thực hiện" value={data.thoiGianThucHienGoiThau} />
            </SectionCard>

            {/* 4. THỜI GIAN & ĐỊA ĐIỂM TỔ CHỨC */}
            <SectionCard title="Tổ chức đấu thầu">
              <InfoRow label="Hình thức dự thầu" value={data.hinhThucDuThau} />
              <InfoRow label="Chi phí nộp E-HSDT" value={data.chiPhiNop ? `${Number(data.chiPhiNop).toLocaleString()} VND` : "Miễn phí"} />
              
              <InfoRow label="Thời điểm đóng thầu" value={formatDate(data.thoiDiemDongThau)} />
              <InfoRow label="Thời điểm mở thầu" value={formatDate(data.thoiDiemMoThau)} />
              
              <InfoRow label="Hiệu lực HSDT" value={data.hieuLucHsdt} />
              <InfoRow label="Địa điểm mở thầu" value={data.diaDiemMoThau} fullWidth />
            </SectionCard>

            {/* 5. ĐẢM BẢO DỰ THẦU */}
            <SectionCard title="Đảm bảo dự thầu">
              <InfoRow label="Số tiền đảm bảo" value={data.soTienDamBaoDuThau ? `${Number(data.soTienDamBaoDuThau).toLocaleString()} VND` : "0 VND"} />
              <InfoRow label="Hình thức đảm bảo" value={data.hinhThucDamBaoDuThau} fullWidth />
            </SectionCard>

            {/* 6. QUYẾT ĐỊNH PHÊ DUYỆT (Pháp lý) */}
            <SectionCard title="Cơ sở pháp lý">
              <InfoRow label="Số quyết định" value={data.soQuyetDinhPheDuyet} />
              <InfoRow label="Ngày phê duyệt" value={formatDate(data.ngayPheDuyet)} />
              <InfoRow label="Cơ quan ban hành" value={data.coQuanBanHanhQuyetDinh} fullWidth />
              <InfoRow label="File quyết định" value={data.quyetDinhPheDuyet} isLink />
            </SectionCard>

          </TabsContent>

          {/* TAB 4: HỒ SƠ GỐC */}
          <TabsContent value="files">
             <div className="bg-white rounded-lg border p-4 shadow-sm">
                {files.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 italic">
                        Không có tài liệu đính kèm nào được tìm thấy.
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {files.map((f) => (
                            <li key={f.fileId} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-md border border-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-50 rounded flex items-center justify-center text-blue-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{f.fileName}</p>
                                        <p className="text-xs text-slate-500 flex gap-2">
                                            <span>{formatDate(f.uploadDate)}</span>
                                            <span>•</span>
                                            <span className="uppercase">{f.fileType}</span>
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" asChild>
                                    <a href={f.filePath} target="_blank" rel="noreferrer">Tải về</a>
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
             </div>
          </TabsContent>
          
          <TabsContent value="ai" className="p-4 bg-white rounded border border-dashed text-slate-500 text-center">
            Tính năng AI Analysis đang được phát triển...
          </TabsContent>
          <TabsContent value="health" className="p-4 bg-white rounded border border-dashed text-slate-500 text-center">
             Tính năng Health Check đang được phát triển...
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
    <div className="bg-slate-50/50 px-4 py-3 border-b">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
      {children}
    </div>
  </div>
);

// Component này đã được tối ưu để chấp nhận null/undefined từ Zod
const InfoRow = ({ 
  label, 
  value, 
  isLink, 
  fullWidth 
}: { 
  label: string; 
  value?: string | number | null; 
  isLink?: boolean; 
  fullWidth?: boolean 
}) => (
  <div className={`flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
    <span className="text-sm font-medium text-slate-500 min-w-[160px]">{label}</span>
    <span className={`text-sm ${isLink ? 'text-blue-600 cursor-pointer hover:underline' : 'text-slate-900'} text-right sm:text-left sm:flex-1 break-words`}>
      {value ?? "--"} 
    </span>
  </div>
);

const DetailSkeleton = () => (
    <div className="p-6 space-y-6 bg-slate-50 h-screen">
        <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-full max-w-3xl" />
        </div>
        <Skeleton className="h-10 w-96" />
        <div className="space-y-4 pt-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    </div>
);

const formatDate = (dateString?: string | null) => { 
    if (!dateString) return "--";
    try {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
        return dateString;
    }
}