import { useEffect, useState } from "react";
import { Plus, FileText, ChevronRight, Loader2, History, LayoutTemplate } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; 
import { Button } from "@/shared/ui/button";

import { Template } from "@/entities/template";

interface TemplateSelectorProps {
  templates: Template[];
  isLoading: boolean;
  onSelect: (content: string) => void;
  onLoadDraft: () => void; 
  isLoadingDraft: boolean; 
}

export const TemplateSelector = ({ 
  templates, 
  isLoading, 
  onSelect, 
  onLoadDraft,
  isLoadingDraft
}: TemplateSelectorProps) => {
  
  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto py-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Chọn nguồn soạn thảo</h3>
        <p className="text-slate-500 text-sm">
           Bạn muốn bắt đầu từ mẫu có sẵn hay tiếp tục bản nháp gần nhất?
        </p>
      </div>

      <Tabs defaultValue="template" className="w-full flex flex-col items-center">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8 bg-slate-100 p-1 h-11">
          <TabsTrigger value="template" className="data-[state=active]:bg-white data-[state=active]:text-[#009d98] font-bold transition-all">Mẫu văn bản</TabsTrigger>
          <TabsTrigger value="draft" className="data-[state=active]:bg-white data-[state=active]:text-[#009d98] font-bold transition-all">Bản nháp đã lưu</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: LIST TEMPLATES --- */}
        <TabsContent value="template" className="w-full">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {/* Card Tạo mới */}
              <div 
                onClick={() => onSelect("")}
                className="cursor-pointer border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-[#009d98] hover:bg-[#009d98]/5 transition-all group bg-slate-50/50"
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 text-slate-400 shadow-sm border border-slate-200 group-hover:border-[#009d98] group-hover:text-[#009d98] transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-700 group-hover:text-[#009d98]">Tạo trang trắng</h4>
                <p className="text-xs text-slate-400 mt-1">Soạn thảo từ đầu</p>
              </div>

              {/* List Templates */}
              {isLoading ? (
                 <div className="col-span-2 flex flex-col items-center justify-center h-[200px] text-slate-400 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#009d98]" /> 
                    <span className="text-sm">Đang tải thư viện mẫu...</span>
                 </div>
              ) : templates.map((tpl) => (
                <div 
                  key={tpl.id}
                  onClick={() => onSelect(tpl.content)}
                  className="group cursor-pointer bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-[#009d98]/50 hover:-translate-y-1 transition-all flex flex-col min-h-[200px] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                      <LayoutTemplate className="w-24 h-24 text-[#009d98] -mr-8 -mt-8" />
                  </div>

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-10 h-10 bg-[#009d98]/10 text-[#009d98] rounded-lg flex items-center justify-center">
                       <FileText className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 font-medium">
                        {tpl.category}
                    </Badge>
                  </div>
                  
                  <div className="relative z-10 flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-800 mb-2 text-base line-clamp-2 group-hover:text-[#009d98] transition-colors">
                          {tpl.title}
                      </h4>
                      <div className="flex items-center text-[#009d98] text-xs font-bold mt-auto opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                        Sử dụng mẫu này <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                  </div>
                </div>
              ))}
           </div>
        </TabsContent>

        {/* --- TAB 2: LOAD DRAFT --- */}
        <TabsContent value="draft" className="w-full">
           <div className="border border-slate-200 rounded-xl p-10 bg-white flex flex-col items-center justify-center text-center min-h-[350px] shadow-sm max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <History className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Tiếp tục công việc dang dở</h3>
              <p className="text-slate-500 max-w-md mb-8 text-sm">
                Hệ thống sẽ khôi phục nội dung bản nháp gần nhất mà bạn đã lưu cho công việc này.
              </p>
              
              <Button 
                size="lg" 
                onClick={onLoadDraft} 
                disabled={isLoadingDraft}
                className="bg-amber-600 hover:bg-amber-700 text-white min-w-[220px] font-bold shadow-md h-12 gap-2"
              >
                 {isLoadingDraft ? <Loader2 className="w-5 h-5 animate-spin" /> : <History className="w-5 h-5" />}
                 {isLoadingDraft ? "Đang khôi phục..." : "Mở lại bản nháp"}
              </Button>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};