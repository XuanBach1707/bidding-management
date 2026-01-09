import { cn } from "@/shared/lib/utils";

export const CleanLandscape = ({ className }: { className?: string }) => {
  // Mask tạo hiệu ứng chiều sâu phức tạp
  const complexGridMask = `
    radial-gradient(ellipse at 20% 30%, black 5%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, black 0%, transparent 45%),
    radial-gradient(circle at 50% 50%, black 0%, transparent 70%),
    radial-gradient(circle at 10% 80%, black 0%, transparent 30%)
  `;

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none select-none bg-slate-900",
        className
      )}
    >
      {/* 1. NỀN TRỜI - Gradient Brand Color */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a8e8a] via-[#126e6b] to-[#0a3f3d]" />

      {/* 2. GRID KỸ THUẬT - Tạo cảm giác "Digital/Construction" */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.05,
          backgroundImage: `
            linear-gradient(#ffffff 1px, transparent 1px),
            linear-gradient(90deg, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px", // Nhỏ hơn chút cho tinh tế
          maskImage: complexGridMask,
          WebkitMaskImage: complexGridMask,
          maskComposite: "add",
          WebkitMaskComposite: "add",
        }}
      />

      {/* 3. LIGHTING EFFECTS - Tạo Glow */}
      <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-[#20a19c]/20 blur-[100px]" />
      <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-white/5 blur-[120px]" />

      {/* 4. ĐỊA HÌNH TRỪU TƯỢNG (Abstract Shapes) */}
      <div className="absolute -bottom-32 -left-1/4 w-[150%] h-[500px] bg-black/20 blur-3xl rounded-[100%]" />
      
      {/* 5. VIGNETTE - Tập trung thị giác vào trung tâm */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/30" />
    </div>
  );
};