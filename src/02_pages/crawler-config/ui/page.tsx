"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Bot, CalendarClock, Activity, Settings2 } from "lucide-react"

// Import 3 widgets chính
import { 
  CrawlerRuleManager, 
  ScheduleManager, 
  SystemLogs 
} from "@/widgets/crawler" 

export default function BotConfigPage() {
  return (
    // Mobile: py-4 px-4. PC: py-8 container chuẩn
    <div className="container mx-auto p-4 md:py-8 max-w-7xl animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <div className="flex flex-col space-y-2 md:space-y-1.5 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[#009d98]/10 rounded-lg shrink-0">
                <Bot className="w-6 h-6 text-[#009d98]" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
                Cấu hình Bot & Hệ thống
            </h1>
        </div>
        {/* Mobile: ml-0 (thẳng hàng). PC: ml-[52px] (thụt vào) */}
        <p className="text-sm text-slate-500 ml-0 md:ml-[52px] leading-relaxed">
          Trung tâm điều khiển: Quản lý luật Crawler, Lập lịch tự động và Theo dõi nhật ký hoạt động.
        </p>
      </div>

      {/* 2. Main Tabs */}
      <Tabs defaultValue="crawler" className="space-y-4 md:space-y-6">
        
        {/* Tab List: Mobile Scroll ngang */}
        <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm pb-2 pt-1 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
            <TabsList className="bg-white border border-slate-200 h-11 p-1 w-max md:w-auto shadow-sm">
                <TabsTrigger 
                    value="crawler" 
                    className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white px-4 md:px-6 h-9 font-semibold transition-all flex gap-2 whitespace-nowrap"
                >
                    <Settings2 size={16} /> Cấu hình Luật
                </TabsTrigger>
                <TabsTrigger 
                    value="schedule" 
                    className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white px-4 md:px-6 h-9 font-semibold transition-all flex gap-2 whitespace-nowrap"
                >
                    <CalendarClock size={16} /> Lập lịch (Schedule)
                </TabsTrigger>
                <TabsTrigger 
                    value="logs" 
                    className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white px-4 md:px-6 h-9 font-semibold transition-all flex gap-2 whitespace-nowrap"
                >
                    <Activity size={16} /> Nhật ký (Logs)
                </TabsTrigger>
            </TabsList>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="min-h-[500px]">
            
            {/* TAB 1: CRAWLER RULES */}
            <TabsContent value="crawler" className="mt-0 focus-visible:outline-none">
                {/* Mobile: p-4. PC: p-6 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
                    <div className="mb-4 md:mb-6 pb-4 border-b border-slate-50">
                        <h3 className="text-lg font-bold text-slate-800">Quản lý Luật Crawl</h3>
                        <p className="text-sm text-slate-500">Định nghĩa các từ khóa và phạm vi ngân sách.</p>
                    </div>
                    <CrawlerRuleManager />
                </div>
            </TabsContent>

            {/* TAB 2: SCHEDULE */}
            <TabsContent value="schedule" className="mt-0 focus-visible:outline-none">
                <ScheduleManager />
            </TabsContent>

            {/* TAB 3: SYSTEM LOGS */}
            <TabsContent value="logs" className="mt-0 focus-visible:outline-none">
                <SystemLogs />
            </TabsContent>

        </div>
      </Tabs>
    </div>
  )
}