import { cn } from "@/shared/lib/utils";

export const CleanLandscape = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none select-none",
        className
      )}
    >
      {/* NỀN TRỜI */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#009d98] via-[#008a85] to-[#006e6a]" />

      {/* GRID KỸ THUẬT – CỰC MỜ */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(#ffffff 1px, transparent 1px),
            linear-gradient(90deg, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "120px 120px",
        }}
      />

      {/* HÌNH HỌC PHỤ – RẤT NHẸ */}
      <div className="absolute top-[18%] left-[12%] w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute top-[32%] right-[18%] w-56 h-56 rounded-full bg-white/4" />

      <div className="absolute top-[48%] left-[30%] w-64 h-24 bg-white/4 rounded-xl" />

      {/* ĐỊA HÌNH – KHỐI TRÒN CHỦ ĐẠO */}
      <div className="absolute -bottom-28 -left-1/4 w-[150%] h-64 bg-black/10 rounded-[100%]" />
      <div className="absolute -bottom-40 -right-1/4 w-[140%] h-72 bg-black/15 rounded-[100%]" />
      <div className="absolute -bottom-52 left-[10%] w-[120%] h-80 bg-black/20 rounded-[100%]" />

      {/* VIGNETTE NHẸ – GIỮ TRUNG TÂM SẠCH */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
    </div>
  );
};
