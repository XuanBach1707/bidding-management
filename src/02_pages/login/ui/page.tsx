import { LoginForm } from "@/features/auth";
import { CleanLandscape } from "@/shared/ui/pc1-landscape";
import { ShieldCheck, Zap, Building2 } from "lucide-react";

export function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 font-sans">
      
      {/* --- LỚP NỀN (BACKGROUND) --- */}
      <div className="absolute inset-0 z-0">
        <CleanLandscape className="w-full h-full object-cover" />
        {/* Lớp phủ noise nhẹ để tăng độ sâu texture (Optional) */}
        <div className="absolute inset-0 bg-black/5 pointer-events-none" /> 
      </div>

      {/* --- GRID LAYOUT CHÍNH --- */}
      <div className="relative z-10 grid lg:grid-cols-12 min-h-screen w-full">

        {/* === CỘT TRÁI: BRANDING & INFO (Chiếm 7 phần) === */}
        {/* [FIXED]: Thay pl-10 bằng px động (responsive padding) để cân đối trên màn hình lớn */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 lg:p-16 xl:p-24 text-white h-full relative">
          
          {/* 1. HEADER BRAND */}
          <div>
             <h3 className="text-lg font-bold tracking-[0.2em] uppercase opacity-80 flex items-center gap-3">
               {/* <span className="w-8 h-[2px] bg-[#20a19c]"></span> */}
               CÔNG TY CỔ PHẦN TẬP ĐOÀN PC1
             </h3>
          </div>

          {/* 2. MAIN CONTENT (Căn giữa theo chiều dọc tự nhiên nhờ flex-col justify-between) */}
          <div className="max-w-3xl">
            <h1 className="text-5xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-8 drop-shadow-sm">
              Hệ thống quản lý <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20a19c] to-[#4fd1c5]">
                Đấu thầu tập trung
              </span>
            </h1>
            
            <p className="text-lg xl:text-xl font-light text-slate-200 leading-relaxed max-w-xl mb-12 border-l-4 border-[#20a19c]/50 pl-6">
              Kiến tạo giá trị bền vững thông qua quy trình minh bạch, 
              hiệu quả và tối ưu hóa nguồn lực kỹ thuật số.
            </p>

            {/* Badges - Glassmorphism nhẹ */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: ShieldCheck, text: "Bảo mật Enterprise" },
                { icon: Zap, text: "Hiệu suất cao" },
                { icon: Building2, text: "Hạ tầng số" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                  <item.icon size={18} className="text-[#20a19c]" />
                  <span className="text-sm font-medium text-slate-100">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. FOOTER */}
          <div className="text-xs text-white/50 font-medium tracking-wider flex gap-6">
            <span>© 2026 PC1 GROUP</span>
            <span className="w-[1px] h-4 bg-white/20"></span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>

        {/* === CỘT PHẢI: FORM ĐĂNG NHẬP (Chiếm 5 phần) === */}
        <div className="lg:col-span-5 flex items-center justify-center p-6 lg:p-12 relative">
          
          {/* Card Container */}
          {/* [FIXED]: Thêm ring-white/50 để tạo viền kính + Shadow sâu hơn */}
          <div className="w-full max-w-[520px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_40px_70px_-15px_rgba(0,0,0,0.3)] overflow-hidden p-10 md:p-14 relative z-20 ring-1 ring-white/50">
             
             {/* Logo Absolute */}
             <div className="absolute top-10 right-10 opacity-90 hover:opacity-100 transition-opacity">
                <img 
                  src="/PC1.jpg" 
                  alt="PC1 Logo" 
                  className="w-24 h-auto object-contain mix-blend-multiply" 
                />
             </div>

             {/* Header Mobile Only */}
             <div className="lg:hidden mb-8">
                <span className="font-bold text-[#0d1f23] text-xl tracking-wide">PC1 GROUP</span>
             </div>

            <div className="mb-10 pt-2">
              <h2 className="text-3xl font-extrabold text-[#0d1f23] mb-3">
                Đăng nhập
              </h2>
              <p className="text-slate-500">
                Vui lòng đăng nhập để truy cập hệ thống đấu thầu.
              </p>
            </div>

            <LoginForm />

          </div>
        </div>

      </div>
    </div>
  );
}