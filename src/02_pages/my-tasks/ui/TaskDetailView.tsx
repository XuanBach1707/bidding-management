"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/06_shared/ui/tabs";
import { Card } from "@/06_shared/ui/card";
import { Badge } from "@/06_shared/ui/badge";
import { Button } from "@/06_shared/ui/button";
import { ScrollArea } from "@/06_shared/ui/scroll-area";
import { Loader2, FileText, MessageSquare, FolderOpen, Calendar, User, Briefcase } from "lucide-react";

// Import API (đảm bảo đường dẫn đúng với project của bạn)
import { taskApi } from "@/05_entities/task/api/task-api";
import { driveApi } from "@/06_shared/api/drive-api";

// Import Workspace Components
import { SelectionWorkspace } from "./selection-workspace";
import { DraftingWorkspace } from "./drafting-workspace";

// --- 1. Định nghĩa Type dựa trên JSON bạn cung cấp ---
interface Assignment {
  assigned_unit_id: number;
  assigned_user_id: number;
  assignment_type: string;
  required_role: string;
  is_accepted: boolean;
}

interface TaskDetailData {
  id: number;
  task_name: string;
  deadline: string | null;
  status: string;
  priority: string | null;
  task_type: "SELECTION" | "DRAFTING" | string; // Type có thể mở rộng
  description: string | null;
  project_name: string | null;
  bidding_project_id: number | null;
  assignee_id: number | null;
  assignments: Assignment[];
}

interface TaskDetailViewProps {
  taskId: string | null;
}

export function TaskDetailView({ taskId }: TaskDetailViewProps) {
  const [task, setTask] = useState<TaskDetailData | null>(null);
  const [loading, setLoading] = useState(false);

  // --- 2. Fetch Data ---
  useEffect(() => {
    if (!taskId) return;

    const fetchTaskDetail = async () => {
      setLoading(true);
      try {
        // Gọi API: http://localhost:8000/tasks/{id}
        const res = await taskApi.getDetail(taskId);
        // Map dữ liệu trả về vào state
        setTask(res.data); 
      } catch (error) {
        console.error("Lỗi lấy thông tin task", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [taskId]);

  // --- Render Loading / Empty State ---
  if (!taskId) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50/50">
        <p>Chọn một công việc từ danh sách để xem chi tiết</p>
      </div>
    );
  }

  if (loading || !task) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Không có hạn";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* --- HEADER --- */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-bold text-slate-800 leading-tight">
            {task.task_name}
          </h1>
        </div>
        
        {/* Project Name Context */}
        {task.project_name && (
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <Briefcase className="w-3.5 h-3.5" />
            <span className="truncate max-w-[500px]">{task.project_name}</span>
          </div>
        )}

        {/* Badges */}
        <div className="flex gap-2 mt-3">
          <Badge variant={task.status === 'OPEN' ? 'default' : 'secondary'}>
            {task.status}
          </Badge>
          <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
            {task.priority || 'NORMAL'}
          </Badge>
          <Badge variant="outline" className="uppercase">
            {task.task_type}
          </Badge>
        </div>
      </div>

      {/* --- TABS --- */}
      <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 border-b bg-slate-50/50">
          <TabsList className="bg-transparent p-0 gap-8 h-auto">
            <TabItem value="info" label="Thông tin chung" />
            <TabItem value="workspace" label="Workspace" />
            <TabItem value="docs" label="Tài liệu công việc" />
          </TabsList>
        </div>

        <ScrollArea className="flex-1 bg-slate-50/30">
          {/* TAB 1: THÔNG TIN CHUNG */}
          <TabsContent value="info" className="m-0 p-6 space-y-6">
            <Card className="p-5 space-y-4 border-slate-200 shadow-sm">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Mô tả công việc</h3>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                  {task.description || "Chưa có mô tả chi tiết cho công việc này."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <User className="w-4 h-4" /> Người thực hiện
                  </div>
                  <div className="font-medium text-slate-800">
                    {/* JSON trả về ID, ở đây hiển thị tạm ID hoặc logic map User Name */}
                    {task.assignee_id ? `User #${task.assignee_id}` : "Chưa chỉ định"}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <Calendar className="w-4 h-4" /> Hạn hoàn thành
                  </div>
                  <div className={`font-medium ${task.deadline ? 'text-red-600' : 'text-slate-800'}`}>
                    {formatDate(task.deadline)}
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2 text-slate-700">
                <MessageSquare className="w-4 h-4" /> Trao đổi / Bình luận
              </h3>
              <div className="border rounded-lg bg-white p-4 min-h-[120px] flex flex-col justify-between shadow-sm">
                 <p className="text-sm text-slate-400 text-center py-4 italic">Chưa có bình luận nào.</p>
                 <div className="flex gap-2">
                    <input className="flex-1 border rounded px-3 py-2 text-sm bg-slate-50 focus:bg-white transition-colors" placeholder="Nhập bình luận..." />
                    <Button size="sm">Gửi</Button>
                 </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: WORKSPACE */}
          <TabsContent value="workspace" className="m-0 h-full flex flex-col">
            {task.task_type === 'SELECTION' ? (
              // Truyền đúng prop task vào SelectionWorkspace
              <SelectionWorkspace task={task} />
            ) : task.task_type === 'DRAFTING' ? (
               // Truyền đúng prop task vào DraftingWorkspace
              <DraftingWorkspace task={task} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <FolderOpen className="w-12 h-12 mb-3 opacity-20" />
                <p>Loại công việc này không có Workspace cụ thể.</p>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: TÀI LIỆU */}
          <TabsContent value="docs" className="m-0 p-6">
             <TaskDocuments 
               projectId={task.bidding_project_id} 
               projectName={task.project_name} 
             />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// --- Sub-components Helper ---

const TabItem = ({ value, label }: { value: string, label: string }) => (
  <TabsTrigger 
    value={value} 
    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-slate-500 rounded-none px-1 py-3 bg-transparent shadow-none hover:text-slate-700 transition-all font-medium"
  >
    {label}
  </TabsTrigger>
);

const TaskDocuments = ({ projectId, projectName }: { projectId: number | null, projectName: string | null }) => {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const fetchDocs = async () => {
      setLoading(true);
      try {
        // LOGIC: Dùng projectId để lấy folder tương ứng
        // Ví dụ: gọi API lấy folder của project ID này
        console.log(`Fetching docs for project: ${projectId}`);
        
        // Mock data giả định để test UI
        // const res = await driveApi.listFiles({ folderId: `project_${projectId}` });
        
        // Giả lập delay
        await new Promise(r => setTimeout(r, 800));
        setDocs([
          { id: 1, name: "Hồ sơ mời thầu.pdf", modifiedTime: new Date().toISOString() },
          { id: 2, name: "Bảng khối lượng.xlsx", modifiedTime: new Date().toISOString() },
        ]);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [projectId]);

  if (!projectId) return <div className="text-center py-8 text-slate-400">Không có thông tin dự án để lấy tài liệu.</div>;
  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <Card className="p-0 overflow-hidden border-slate-200">
      <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
        <h3 className="font-medium text-sm text-slate-700 flex items-center gap-2">
           <FolderOpen className="w-4 h-4 text-blue-500"/> Tài liệu dự án
        </h3>
        <Button variant="outline" size="sm" className="h-8 text-xs">Upload file</Button>
      </div>
      
      {docs.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-400">Thư mục trống.</div>
      ) : (
        <div className="divide-y">
          {docs.map((doc, idx) => (
            <div key={idx} className="flex items-center p-3 hover:bg-slate-50 transition cursor-pointer group">
              <FileText className="w-8 h-8 text-red-500 mr-3 opacity-80" />
              <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors truncate">{doc.name}</p>
                 <p className="text-xs text-slate-400">Cập nhật: {new Date(doc.modifiedTime).toLocaleDateString()}</p>
              </div>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Tải xuống</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};