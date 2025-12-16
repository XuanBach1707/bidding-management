"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"

// Import 3 widgets chính
import { 
  CrawlerRuleManager, 
  ScheduleManager, 
  SystemLogs 
} from "@/widgets/crawler" 

export default function BotConfigPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cấu hình Bot & Hệ thống</h1>
        <p className="text-muted-foreground">
          Quản lý luật Crawler, Lập lịch chạy tự động và Theo dõi nhật ký hệ thống.
        </p>
      </div>

      <Separator />

      {/* 2. Tabs */}
      <Tabs defaultValue="crawler" className="space-y-4">
        
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="crawler">Cấu hình Crawler</TabsTrigger>
          <TabsTrigger value="schedule">Lập kế hoạch (Schedule)</TabsTrigger>
          <TabsTrigger value="logs">Nhật ký (Logs)</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: CRAWLER --- */}
        <TabsContent value="crawler" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Luật Crawl</CardTitle>
              <CardDescription>
                Quản lý các từ khóa, ngân sách và phạm vi quét dữ liệu thầu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CrawlerRuleManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: SCHEDULE (Đã cập nhật) --- */}
        <TabsContent value="schedule" className="space-y-4">
            {/* Xóa bỏ Grid chia cột ở đây. 
                ScheduleManager bây giờ sẽ tự chiếm full width và chia cột bên trong nó 
            */}
            <ScheduleManager />
        </TabsContent>

        {/* --- TAB 3: LOGS --- */}
        <TabsContent value="logs" className="space-y-4">
           <SystemLogs />
        </TabsContent>

      </Tabs>
    </div>
  )
}