"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Task } from "@/entities/task"; 
import { Badge } from "@/shared/ui/badge";
import { User, Flag, Clock, AlertCircle } from "lucide-react"; 
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { AutoFetchFileCell } from "./auto-fetch-file-cell"; 

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDING_REVIEW": return "bg-[#009d98]/10 text-[#009d98] border-[#009d98]/20";
    case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200";
    case "ASSIGNED": return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "OPEN": return "bg-slate-100 text-slate-600 border-slate-200";
    case "REJECTED":
    case "OVERDUE": return "bg-red-50 text-red-700 border-red-200";
    default: return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const PriorityIcon = ({ priority }: { priority: string }) => {
  if (priority === "HIGH") return <Flag className="h-3.5 w-3.5 text-red-600 fill-red-600 shrink-0" />;
  if (priority === "MEDIUM") return <Flag className="h-3.5 w-3.5 text-[#009d98] fill-[#009d98] shrink-0" />;
  return <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 shrink-0" />;
};

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "taskName",
    header: () => <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Hạng mục</span>,
    cell: ({ row }) => {
      const { taskName, priority } = row.original;
      return (
        <div className="flex items-center gap-3 py-1" style={{ paddingLeft: `${row.depth * 20}px` }}>
          <PriorityIcon priority={priority} />
          {/* [UPDATE] Giới hạn max-width để tránh vỡ layout nếu tên quá dài */}
          <span className={cn(
            "text-sm tracking-tight truncate max-w-[150px] md:max-w-[300px]",
            priority === "HIGH" ? "font-bold text-red-900" : 
            priority === "MEDIUM" ? "font-bold text-slate-800" : "font-medium text-slate-600"
          )} title={taskName}>
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
          "h-5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide shadow-none border shrink-0",
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
      if (!dateStr) return <span className="text-slate-300 italic text-[10px] font-mono">--/--/--</span>;
      
      const date = new Date(dateStr);
      const isOverdue = date < new Date() && row.getValue("status") !== "COMPLETED";

      return (
        <div className={cn(
          "flex items-center gap-1.5 text-xs font-mono whitespace-nowrap",
          isOverdue ? "text-red-600 font-bold" : "text-slate-500 font-medium"
        )}>
          {isOverdue ? <AlertCircle className="h-3 w-3 shrink-0" /> : <Clock className="h-3 w-3 opacity-50 shrink-0" />}
          {format(date, "dd/MM/yyyy", { locale: vi })}
        </div>
      );
    },
  },
  
  {
    id: "assignee",
    header: () => <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Phân công / Hồ sơ</span>,
    cell: ({ row }) => {
      const { assignments, taskName } = row.original;

      // 1. Nếu CÓ người phụ trách
      if (assignments && assignments.length > 0) {
        const firstAssignee = assignments[0];
        const assignedId = firstAssignee.assignedUserId || firstAssignee.assignedUnitId;
        
        return (
          <div className="flex items-center gap-2">
             <div className="h-6 w-6 rounded-full bg-[#009d98]/10 border border-[#009d98]/20 flex items-center justify-center text-[9px] font-bold text-[#009d98] shadow-sm shrink-0">
                U{assignedId}
             </div>
             <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[80px] md:max-w-[100px]">
                  User {assignedId}
                </span>
             </div>
          </div>
        );
      }

      // 2. Nếu CHƯA CÓ người phụ trách -> Component tìm File
      return (
        <div className="min-h-[24px] flex items-center">
            <AutoFetchFileCell taskName={taskName} />
        </div>
      );
    },
  }
];