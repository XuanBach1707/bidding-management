import { cn } from "@/shared/lib/utils";

export const CleanLandscape = ({ className }: { className?: string }) => {
  // Định nghĩa mask phức tạp
  const complexGridMask = `
    radial-gradient(ellipse at 20% 30%, black 5%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, black 0%, transparent 45%),
    radial-gradient(circle at 50% 50%, black 0%, transparent 70%),
    radial-gradient(circle at 10% 80%, black 0%, transparent 30%)
  `;

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none select-none",
        className
      )}
    >
      {/* 1. NỀN TRỜI - [UPDATED] Đổi sang màu chủ đạo mới #20a19c */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#20a19c] via-[#178581] to-[#0f5c59]" />

      {/* 2. GRID KỸ THUẬT */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.07,
          backgroundImage: `
            linear-gradient(#ffffff 1px, transparent 1px),
            linear-gradient(90deg, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "120px 120px",
          maskImage: complexGridMask,
          WebkitMaskImage: complexGridMask,
          maskComposite: "add",
          WebkitMaskComposite: "add",
        }}
      />

      {/* 3. HÌNH HỌC PHỤ */}
      <div className="absolute top-[18%] left-[12%] w-40 h-40 rounded-full bg-white/5 blur-[40px]" />
      <div className="absolute top-[32%] right-[18%] w-56 h-56 rounded-full bg-white/4 blur-[50px]" />
      <div className="absolute top-[48%] left-[30%] w-64 h-24 bg-white/3 rounded-full blur-[30px]" />

      {/* 4. ĐỊA HÌNH */}
      <div className="absolute -bottom-28 -left-1/4 w-[150%] h-64 bg-black/10 rounded-[100%]" />
      <div className="absolute -bottom-40 -right-1/4 w-[140%] h-72 bg-black/15 rounded-[100%]" />
      <div className="absolute -bottom-52 left-[10%] w-[120%] h-80 bg-black/20 rounded-[100%]" />

      {/* 5. VIGNETTE */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
    </div>
  );
};