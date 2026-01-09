import { LoginForm } from "@/features/auth";
import { CleanLandscape } from "@/shared/ui/pc1-landscape";

export function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      
      {/* --- LỚP NỀN: LANDSCAPE FULL MÀN HÌNH --- */}
      <div className="absolute inset-0 z-0">
        <CleanLandscape className="w-full h-full object-cover" />
        {/* Lớp phủ để tăng độ tương phản cho text */}
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" /> 
      </div>

      {/* --- LỚP NỘI DUNG --- */}
      {/* - max-w-[1700px]: Nới rộng khung chứa để nội dung giãn ra thêm.
          - gap-x-20: Tăng khoảng cách trống ở giữa hai cột.
      */}
      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen w-full max-w-[1700px] mx-auto gap-x-20">

        {/* CỘT TRÁI: BRANDING NỘI DUNG */}
        {/* p-16 và pl-20 để giữ khoảng cách với mép trái màn hình vừa phải */}
        <div className="hidden lg:flex flex-col justify-between p-16 pl-20 text-white">
          {/* Header Text */}
          <div>
            <h3 className="text-xl font-bold tracking-widest uppercase opacity-80 mb-2">
              PC1 GROUP
            </h3>
            <div className="h-1 w-12 bg-[#009d98] mb-6" />
          </div>

          {/* Main Message: Căn lề trái tự nhiên để giãn xa form hơn */}
          <div className="max-w-xl">
            <h1 className="text-6xl font-extrabold tracking-tight leading-[1.1] mb-8">
              Digital <br /> 
              <span className="text-[#009d98]">Transformation.</span>
            </h1>
            <p className="text-xl font-light text-white/90 leading-relaxed max-w-md border-l-2 border-[#009d98] pl-8">
              Hệ thống quản lý đấu thầu tập trung – Nâng cao hiệu quả, minh bạch
              và tối ưu hóa nguồn lực dự án.
            </p>
          </div>

          {/* Footer Text */}
          <div className="flex items-center gap-4 text-xs font-medium text-white/50 uppercase tracking-widest">
            <span>Enterprise System</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span>Internal Use Only</span>
          </div>
        </div>

        {/* CỘT PHẢI: FORM ĐĂNG NHẬP */}
        {/* justify-center giúp form nằm giữa cột phải, tạo độ giãn tự nhiên với cột trái */}
        <div className="flex items-center justify-center lg:justify-center p-8 pr-20">
          <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20">

            {/* Header Mobile (Chỉ hiện khi màn hình nhỏ) */}
            <div className="lg:hidden mb-8 text-center">
              <h2 className="text-2xl font-black text-[#009d98] uppercase tracking-wider">
                PC1 Group
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Bidding Hub
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Đăng nhập
              </h2>
              <div className="h-1.5 w-10 bg-[#009d98] mt-3 rounded-full" />
            </div>

            <LoginForm />

            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-medium">
                © 2026 PC1 Group Joint Stock Company. <br />
                <span className="opacity-70">Version 1.0.0 (Stable)</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}