import { useEffect, useState } from "react";
import { Plus, FileText, ChevronRight, Loader2, History } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; // Nhớ import Tabs
import { Button } from "@/shared/ui/button";

import { Template } from "@/entities/template";

interface TemplateSelectorProps {
  templates: Template[];
  isLoading: boolean;
  onSelect: (content: string) => void;
  onLoadDraft: () => void; // Hàm gọi API load draft
  isLoadingDraft: boolean; // Trạng thái đang load draft
}

export const TemplateSelector = ({ 
  templates, 
  isLoading, 
  onSelect, 
  onLoadDraft,
  isLoadingDraft
}: TemplateSelectorProps) => {
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Chọn nguồn soạn thảo</h3>
        <p className="text-slate-500 text-sm">
           Bạn muốn bắt đầu từ mẫu mới hay tiếp tục bản nháp cũ?
        </p>
      </div>

      <Tabs defaultValue="template" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="template">Mẫu văn bản</TabsTrigger>
          <TabsTrigger value="draft">Bản nháp đã lưu</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: LIST TEMPLATES (Code cũ) --- */}
        <TabsContent value="template" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card Tạo mới */}
              <div 
                onClick={() => onSelect("")}
                className="cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[180px] hover:border-blue-500 hover:bg-blue-50 transition-all bg-white"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
                  <Plus className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-700">Tạo trắng</h4>
              </div>

              {/* List Templates */}
              {isLoading ? (
                 <div className="col-span-2 flex items-center justify-center h-[180px] text-slate-400 italic gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang tải mẫu...
                 </div>
              ) : templates.map((tpl) => (
                <div 
                  key={tpl.id}
                  onClick={() => onSelect(tpl.content)}
                  className="group cursor-pointer border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-500 transition-all bg-white flex flex-col min-h-[180px] relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                       <FileText className="w-4 h-4" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 font-normal">{tpl.category}</Badge>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2 text-sm line-clamp-2 group-hover:text-blue-700">{tpl.title}</h4>
                  <div className="flex items-center text-blue-600 text-xs font-medium mt-auto group-hover:translate-x-1 transition-transform">
                    Sử dụng mẫu <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              ))}
           </div>
        </TabsContent>

        {/* --- TAB 2: LOAD DRAFT (Mới) --- */}
        <TabsContent value="draft">
           <div className="border border-slate-200 rounded-xl p-8 bg-white flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
                  <History className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Tiếp tục công việc</h3>
              <p className="text-slate-500 max-w-md mb-6">
                Hệ thống sẽ tải lại nội dung bản nháp gần nhất mà bạn đã lưu cho công việc này.
              </p>
              
              <Button 
                size="lg" 
                onClick={onLoadDraft} 
                disabled={isLoadingDraft}
                className="bg-orange-600 hover:bg-orange-700 min-w-[200px]"
              >
                 {isLoadingDraft ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                 {isLoadingDraft ? "Đang tải..." : "Mở bản nháp"}
              </Button>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};