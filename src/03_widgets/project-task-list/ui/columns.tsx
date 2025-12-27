"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Task } from "@/entities/task"; 
import { Badge } from "@/shared/ui/badge";
import { User, Flag, Clock, AlertCircle } from "lucide-react"; 
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
// Import component vừa tạo ở trên
import { AutoFetchFileCell } from "./auto-fetch-file-cell"; 

// --- HELPER FUNCTIONS ---
const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED": return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
    case "PENDING_REVIEW": return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50";
    case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50";
    case "ASSIGNED": return "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50";
    case "OPEN": return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100";
    case "REJECTED":
    case "OVERDUE": return "bg-red-50 text-red-700 border-red-200 hover:bg-red-50";
    default: return "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100";
  }
};

const PriorityIcon = ({ priority }: { priority: string }) => {
  if (priority === "HIGH") return <Flag className="h-3.5 w-3.5 text-red-600 fill-red-600 shrink-0" />;
  if (priority === "MEDIUM") return <Flag className="h-3.5 w-3.5 text-blue-600 fill-blue-600 shrink-0" />;
  return <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 shrink-0" />;
};

// --- MAIN COLUMNS DEFINITION ---
export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "taskName",
    header: () => <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Hạng mục</span>,
    cell: ({ row }) => {
      const { taskName, priority } = row.original;
      return (
        <div className="flex items-center gap-3 py-1" style={{ paddingLeft: `${row.depth * 20}px` }}>
          <PriorityIcon priority={priority} />
          <span className={cn(
            "text-sm tracking-tight truncate max-w-[300px]",
            priority === "HIGH" ? "font-bold text-red-900" : 
            priority === "MEDIUM" ? "font-semibold text-slate-800" : "font-medium text-slate-600"
          )}>
            {taskName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Trạng thái</span>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant="outline" className={cn(
          "h-5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-tighter shadow-none border",
          getStatusColor(status)
        )}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "deadline",
    header: () => <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Deadline</span>,
    cell: ({ row }) => {
      const dateStr = row.getValue("deadline") as string | null;
      if (!dateStr) return <span className="text-slate-300 italic text-[10px]">--</span>;
      
      const date = new Date(dateStr);
      const isOverdue = date < new Date() && row.getValue("status") !== "COMPLETED";

      return (
        <div className={cn(
          "flex items-center gap-1.5 text-xs font-semibold",
          isOverdue ? "text-red-600 font-bold" : "text-slate-500"
        )}>
          {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {format(date, "dd/MM/yyyy", { locale: vi })}
        </div>
      );
    },
  },
  
  // --- CỘT ASSIGNEE / FILE ---
  {
    id: "assignee",
    header: () => <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Phân công / Hồ sơ</span>,
    cell: ({ row }) => {
      const { assignments, taskName } = row.original;

      // 1. Kiểm tra mảng Assignments
      // Nếu mảng CÓ phần tử => Đã có người phụ trách -> Hiển thị người đó
      if (assignments && assignments.length > 0) {
        // Lấy người đầu tiên (hoặc logic hiển thị list người của bạn)
        const firstAssignee = assignments[0];
        const assignedId = firstAssignee.assignedUserId || firstAssignee.assignedUnitId; // Ví dụ lấy ID
        
        return (
          <div className="flex items-center gap-2">
             <div className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm shrink-0">
                {/* Giả lập avatar bằng chữ cái đầu hoặc ID */}
                U{assignedId}
             </div>
             <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-600 truncate max-w-[100px]">
                  User {assignedId}
                </span>
                {/* Nếu muốn hiện thêm thông tin Unit/Role thì thêm ở đây */}
             </div>
          </div>
        );
      }

      // 2. Nếu assignments là RỖNG ([]) => Chưa có người -> Hiển thị Component tìm File
      // Component <AutoFetchFileCell /> sẽ tự động gọi API (như code ở trên) 
      // và quyết định hiển thị File hay placeholder "--"
      return (
        <div className="min-h-[24px] flex items-center">
            <AutoFetchFileCell taskName={taskName} />
        </div>
      );
    },
  }
];