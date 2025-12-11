import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { SectionGroup } from '../types/dynamic-view';
import { cn } from "@/shared/lib/utils";
interface DynamicDetailViewProps {
  sections?: SectionGroup[];
  className?: string;
  isLoading?: boolean;
}

export function DynamicDetailView({ sections, className, isLoading = false }: DynamicDetailViewProps) {
  
  // --- LOADING SKELETON (Cũng sửa thành 1 cột cho đồng bộ) ---
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm border-gray-200">
            <CardHeader className="py-3 px-4 bg-gray-50/50 border-b">
              <Skeleton className="h-5 w-48 bg-gray-200" />
            </CardHeader>
            <CardContent className="p-4">
              {/* SỬA: grid-cols-1 để loading cũng hiện 1 cột */}
              <div className="grid grid-cols-1 gap-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-24 bg-gray-100" />
                    <Skeleton className="h-4 w-3/4 bg-gray-200" /> {/* Value dài ra chút cho đẹp */}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!sections || sections.length === 0) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {sections.map((section) => (
        <Card key={section.id} className="shadow-sm border-gray-200">
          <CardHeader className="py-3 px-4 bg-gray-50/50 border-b">
            <CardTitle className="text-sm font-semibold text-gray-700">
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* SỬA CHÍNH TẠI ĐÂY: Luôn là 1 cột */}
            <div className="grid grid-cols-1 gap-y-5"> 
              {section.fields.map((field, index) => (
                <div 
                  key={field.key || index} 
                  // Bỏ logic col-span vì giờ chỉ có 1 cột
                  className="flex flex-col gap-1"
                >
                  <span className="text-xs text-gray-500 font-medium">
                    {field.label}
                  </span>
                  {/* Thêm chút style cho value để dễ đọc hơn trên màn hình rộng */}
                  <span className="text-sm text-gray-900 font-medium break-words leading-relaxed max-w-4xl">
                    {field.value ? field.value : "--"}
                  </span>
                  
                  {/* Tùy chọn: Nếu muốn có đường kẻ mờ ngăn cách giữa các dòng (như danh sách) thì uncomment dòng dưới */}
                  {/* <div className="h-px bg-gray-100 mt-2" /> */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}