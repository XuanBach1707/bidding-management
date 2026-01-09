"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Bot, CalendarClock, Activity, Settings2 } from "lucide-react"

// Import 3 widgets chính đã tối ưu
import { 
  CrawlerRuleManager, 
  ScheduleManager, 
  SystemLogs 
} from "@/widgets/crawler" 

export default function BotConfigPage() {
  return (
    <div className="container mx-auto py-8 max-w-7xl animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <div className="flex flex-col space-y-1.5 mb-8 px-1">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[#009d98]/10 rounded-lg">
                <Bot className="w-6 h-6 text-[#009d98]" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Cấu hình Bot & Hệ thống
            </h1>
        </div>
        <p className="text-sm text-slate-500 ml-[52px]">
          Trung tâm điều khiển: Quản lý luật Crawler, Lập lịch tự động và Theo dõi nhật ký hoạt động.
        </p>
      </div>

      {/* 2. Main Tabs */}
      <Tabs defaultValue="crawler" className="space-y-6">
        
        {/* Tab List: Style hiện đại, nền xám nhẹ */}
        <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm pb-2 pt-1">
            <TabsList className="bg-white border border-slate-200 h-11 p-1 w-full sm:w-auto shadow-sm">
                <TabsTrigger 
                    value="crawler" 
                    className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white px-6 h-9 font-semibold transition-all flex gap-2"
                >
                    <Settings2 size={16} /> Cấu hình Luật
                </TabsTrigger>
                <TabsTrigger 
                    value="schedule" 
                    className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white px-6 h-9 font-semibold transition-all flex gap-2"
                >
                    <CalendarClock size={16} /> Lập lịch (Schedule)
                </TabsTrigger>
                <TabsTrigger 
                    value="logs" 
                    className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white px-6 h-9 font-semibold transition-all flex gap-2"
                >
                    <Activity size={16} /> Nhật ký (Logs)
                </TabsTrigger>
            </TabsList>
        </div>

        {/* --- CONTENT AREA --- */}
        {/* Min-height để tránh giật layout khi chuyển tab */}
        <div className="min-h-[500px]">
            
            {/* TAB 1: CRAWLER RULES */}
            <TabsContent value="crawler" className="mt-0 focus-visible:outline-none">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="mb-6 pb-4 border-b border-slate-50">
                        <h3 className="text-lg font-bold text-slate-800">Quản lý Luật Crawl</h3>
                        <p className="text-sm text-slate-500">Định nghĩa các từ khóa và phạm vi ngân sách để Bot tìm kiếm gói thầu phù hợp.</p>
                    </div>
                    <CrawlerRuleManager />
                </div>
            </TabsContent>

            {/* TAB 2: SCHEDULE */}
            <TabsContent value="schedule" className="mt-0 focus-visible:outline-none">
                {/* ScheduleManager đã có Card bên trong nên không cần bọc thêm Card ở ngoài nữa */}
                <ScheduleManager />
            </TabsContent>

            {/* TAB 3: SYSTEM LOGS */}
            <TabsContent value="logs" className="mt-0 focus-visible:outline-none">
                {/* SystemLogs cũng đã có Card full-height */}
                <SystemLogs />
            </TabsContent>

        </div>
      </Tabs>
    </div>
  )
}