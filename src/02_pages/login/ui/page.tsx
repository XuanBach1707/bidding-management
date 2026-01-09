import { LoginForm } from "@/features/auth";
import { CleanLandscape } from "@/shared/ui/pc1-landscape";
import { ShieldCheck, Zap, Building2 } from "lucide-react";

export function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      
      {/* --- LỚP NỀN --- */}
      <div className="absolute inset-0 z-0">
        <CleanLandscape className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" /> 
      </div>

      {/* --- LỚP NỘI DUNG --- */}
      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen w-full max-w-[1700px] mx-auto gap-x-20">

        {/* === CỘT TRÁI === */}
        {/* Sửa p-16 thành px-20 py-12 để đẩy nội dung sát lề trên/dưới hơn */}
        <div className="hidden lg:flex flex-col justify-between px-20 py-12 text-white h-full">
          
          {/* 1. HEADER BRAND (Góc trên cùng bên trái) */}
          <div>
             {/* Đã bỏ gạch chân và đẩy lên cao */}
             <h3 className="text-xl font-bold tracking-widest uppercase opacity-90">
               CÔNG TY CỔ PHẦN TẬP ĐOÀN PC1
             </h3>
          </div>

          {/* 2. MAIN CONTENT (Nằm giữa) */}
          <div className="max-w-2xl mb-10">
            <h1 className="text-6xl font-bold tracking-tight leading-[1.15] mb-6">
              Hệ thống quản lý <br /> 
              <span className="text-[#20a19c]">Đấu thầu Tập trung</span>
            </h1>
            
            <p className="text-xl font-light text-white/90 leading-relaxed max-w-lg mb-10 border-l-2 border-[#20a19c] pl-6">
              Kiến tạo giá trị bền vững thông qua quy trình minh bạch, 
              hiệu quả và tối ưu hóa nguồn lực kỹ thuật số.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                <ShieldCheck size={18} className="text-[#20a19c]" />
                <span className="text-sm font-medium">Bảo mật Enterprise</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                <Zap size={18} className="text-[#20a19c]" />
                <span className="text-sm font-medium">Hiệu suất cao</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                <Building2 size={18} className="text-[#20a19c]" />
                <span className="text-sm font-medium">Hạ tầng số</span>
              </div>
            </div>
          </div>

          {/* 3. FOOTER (Góc dưới cùng bên trái) */}
          <div className="text-xs text-white/60 font-medium tracking-wider">
            © 2026 PC1 GROUP JS COMPANY
          </div>
        </div>

        {/* === CỘT PHẢI: FORM ĐĂNG NHẬP === */}
        <div className="flex items-center justify-center lg:justify-center p-6">
          <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden p-10 md:p-12 relative z-20 border border-white/20">
             
             {/* Logo góc phải form */}
             <div className="absolute top-10 right-10">
                <img 
                  src="/PC1.jpg" 
                  alt="PC1 Logo" 
                  className="w-28 h-auto object-contain" 
                />
             </div>

             {/* Header Mobile Only */}
             <div className="lg:hidden mb-8 flex items-center gap-2">
                <span className="font-bold text-[#0d1f23] text-lg">PC1 GROUP</span>
             </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0d1f23] mb-2">
                Đăng nhập
              </h2>
              <div className="h-1.5 w-12 bg-[#20a19c] rounded-full" />
            </div>

            <LoginForm />

          </div>
        </div>

      </div>
    </div>
  );
}