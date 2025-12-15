import { Skeleton } from "@/shared/ui/skeleton";

export const BiddingCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" /> 
        <Skeleton className="h-6 w-24 rounded-full" /> 
      </div>

      {/* Title */}
      <div className="space-y-2 py-1">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-y-2 md:grid-cols-2 lg:gap-x-8 mt-2">
        {/* Cột trái */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 shrink-0 rounded-full" /> 
            <Skeleton className="h-4 w-48" /> 
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          {/* Đã xóa Skeleton dòng Địa điểm */}
        </div>
      </div>

      <hr className="border-slate-100 my-2" />

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-32" />
        </div>
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
};