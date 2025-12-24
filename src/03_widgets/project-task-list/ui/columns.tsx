"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Task, TaskAssignment } from "@/entities/task"; 
import { Badge } from "@/shared/ui/badge";
import { User, Flag, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "taskName",
    header: () => <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Hạng mục</span>,
    cell: ({ row }) => {
      const { taskName, isMilestone } = row.original;
      return (
        <div className="flex items-center gap-3 py-1" style={{ paddingLeft: `${row.depth * 20}px` }}>
          {isMilestone ? (
            <Flag className="h-3.5 w-3.5 text-blue-600 fill-blue-600 shrink-0" />
          ) : (
            <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1.5 shrink-0" />
          )}
          <span className={cn(
            "text-sm tracking-tight",
            isMilestone ? "font-bold text-slate-900" : "font-medium text-slate-600"
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
          "h-5 px-2 text-[9px] font-bold uppercase tracking-tighter border-none shadow-none",
          status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
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
      return (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Clock className="h-3 w-3" />
          {format(new Date(dateStr), "dd/MM/yyyy", { locale: vi })}
        </div>
      );
    },
  },
  {
    id: "assignee",
    header: () => <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Phụ trách</span>,
    cell: ({ row }) => {
      const { assigneeId } = row.original;
      return (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
            <User className="h-3 w-3 text-blue-500" />
          </div>
          <span className="text-[11px] font-bold text-slate-600">
            {assigneeId ? `U-${assigneeId}` : "--"}
          </span>
        </div>
      );
    },
  }
];