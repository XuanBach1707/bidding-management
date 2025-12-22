"use client";

import { ColumnDef } from "@tanstack/react-table";
// Import từ Public API của Entities
import { 
  Task, 
  TaskAssignment, 
  TaskStatusEnum, 
  AssignmentTypeEnum 
} from "@/entities/task"; 
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal, 
  Calendar, 
  User,
  Flag
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "taskName",
    header: "Tên công việc",
    size: 400,
    cell: ({ row }) => {
      const { taskName, isMilestone } = row.original;
      
      return (
        <div 
          className="flex items-center gap-2" 
          style={{ paddingLeft: `${row.depth * 24}px` }}
        >
          {row.getCanExpand() ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="p-1 rounded hover:bg-slate-100 transition-colors"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-500" />
              )}
            </button>
          ) : (
             <span className="w-6" /> 
          )}
          
          <div className="flex items-center gap-2 overflow-hidden">
            {isMilestone && <Flag className="h-3 w-3 text-blue-600 fill-blue-600 flex-shrink-0" />}
            <span className={`text-sm truncate ${isMilestone ? "font-bold text-blue-900" : "text-slate-700"}`}>
              {taskName}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "deadline",
    header: "Hạn chót",
    cell: ({ row }) => {
      const dateStr = row.getValue("deadline") as string | null;
      if (!dateStr) return <span className="text-slate-400 text-xs italic">--</span>;
      
      try {
        return (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(dateStr), "dd/MM/yyyy", { locale: vi })}</span>
          </div>
        );
      } catch (e) {
        return <span className="text-red-400 text-xs">Lỗi ngày</span>;
      }
    },
  },
  {
    accessorKey: "assignments",
    header: "Phụ trách chính",
    cell: ({ row }) => {
      const assignments = row.original.assignments as TaskAssignment[];
      
      // So sánh trực tiếp với string "MAIN" vì Zod Enum hỗ trợ kiểu này
      const mainAssignee = assignments?.find(a => a.assignmentType === "MAIN");

      if (!mainAssignee) return <span className="text-slate-400 text-xs">--</span>;

      return (
        <div className="flex items-center gap-2">
           <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
             <User className="h-3.5 w-3.5 text-blue-600" />
           </div>
           <div className="flex flex-col leading-tight">
             <span className="text-sm font-medium text-slate-700">
               {mainAssignee.assignedUserId 
                 ? `NV-${mainAssignee.assignedUserId}` 
                 : "Chờ phân công"}
             </span>
             <span className="text-[10px] text-slate-500 uppercase tracking-wider">
               {mainAssignee.requiredRole}
             </span>
           </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      const statusMap: Record<string, string> = {
        OPEN: "bg-slate-100 text-slate-600 border-slate-200",
        ASSIGNED: "bg-blue-50 text-blue-600 border-blue-100",
        IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
        PENDING_REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
        COMPLETED: "bg-green-50 text-green-700 border-green-200",
        REJECTED: "bg-red-50 text-red-700 border-red-200",
      };

      return (
        <Badge variant="outline" className={`${statusMap[status] || "bg-gray-100"} font-medium`}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <div className="flex justify-end">
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];