import { LoginForm } from "@/features/auth";
import { CleanLandscape } from "@/shared/ui/pc1-landscape";

export function LoginPage() {
  return (
    // Container chính chiếm toàn màn hình
    <div className="relative min-h-screen w-full overflow-hidden">
      
      {/* --- LỚP NỀN: LANDSCAPE FULL MÀN HÌNH --- */}
      <div className="absolute inset-0 z-0">
        <CleanLandscape className="w-full h-full object-cover" />
        {/* Lớp phủ nhẹ để đảm bảo chữ và form luôn rõ ràng */}
        <div className="absolute inset-0 bg-black/20" /> 
      </div>

      {/* --- LỚP NỘI DUNG: CHIA CỘT ĐÈ LÊN NỀN --- */}
      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen w-full">

        {/* CỘT TRÁI: GIỮ NGUYÊN NỘI DUNG CỦA BẠN */}
        <div className="hidden lg:flex flex-col justify-between p-16 text-white">
          {/* Header Text */}
          <div>
            <h3 className="text-xl font-bold tracking-widest uppercase opacity-80 mb-2">
              PC1 GROUP
            </h3>
            <div className="h-1 w-12 bg-white/50 mb-6" />
          </div>

          {/* Main Message */}
          <div className="max-w-xl">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Digital <br /> Transformation.
            </h1>
            <p className="text-lg font-light text-white/90 leading-relaxed max-w-md border-l-2 border-white/30 pl-6">
              Hệ thống quản lý đấu thầu tập trung – Nâng cao hiệu quả, minh bạch
              và tối ưu hóa nguồn lực dự án.
            </p>
          </div>

          {/* Footer Text */}
          <div className="flex items-center gap-4 text-xs font-medium text-white/60 uppercase tracking-widest">
            <span>Enterprise System</span>
            <span className="w-1 h-1 bg-white/60 rounded-full" />
            <span>Internal Use Only</span>
          </div>
        </div>

        {/* CỘT PHẢI: FORM ĐĂNG NHẬP (VỊ TRÍ CŨ NHƯNG ĐÈ LÊN NỀN) */}
        <div className="flex items-center justify-center p-8">
          {/* Thêm backdrop-blur và bg-white/90 để form tách biệt khỏi nền landscape */}
          <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-2xl border border-white/20">

            {/* Header Mobile (Chỉ hiện khi màn hình nhỏ) */}
            <div className="lg:hidden mb-8 text-center">
              <h2 className="text-2xl font-black text-[#009d98] uppercase tracking-wider">
                PC1 Group
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Bidding Hub
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Đăng nhập,
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
              </p>
            </div>

            <LoginForm />

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                © 2026 PC1 Group Joint Stock Company. <br />
                Version 1.0.0 (Stable)
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}