import React, { useState } from 'react';
import { ChevronRight, ChevronDown, MoreHorizontal, Plus, Trash, Calendar as CalendarIcon } from 'lucide-react'; // Thêm CalendarIcon
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { cn } from "@/shared/lib/utils";

// --- IMPORT MỚI CHO DATE PICKER ---
import { format, parse } from "date-fns"; // Cần hàm parse để đổi chuỗi -> Date
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { PlanNode, EditorAssignee } from '../types/ai-plan-editor';
interface PlanEditorRowProps {
  node: PlanNode;
  isGroup: boolean;
  users: EditorAssignee[];
  onUpdate: (id: string, field: keyof PlanNode, value: any) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
}

export function PlanEditorRow({ node, isGroup, users, onUpdate, onAddChild, onDelete }: PlanEditorRowProps) {
  const [isOpen, setIsOpen] = useState(true);
  const selectedUser = users.find(u => u.id === node.assigneeId);

  // --- HÀM HELPER: CHUYỂN ĐỔI CHUỖI "dd/MM/yyyy" THÀNH DATE OBJECT ---
  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    try {
        // Parse chuỗi "20/12/2025" thành Date object
        return parse(dateString, "dd/MM/yyyy", new Date());
    } catch (e) {
        return undefined;
    }
  };

  const selectedDate = parseDate(node.deadline);

  // Layout chung cho cả Cha và Con
  const RowContent = (
    <div 
      className={cn(
        "flex items-center gap-2 py-2 border-b hover:bg-gray-50 group transition-colors relative",
        isGroup ? "bg-purple-50/40" : ""
      )}
      style={{ 
        borderLeft: isGroup ? '4px solid #a855f7' : '4px solid transparent',
        paddingLeft: isGroup ? '12px' : '48px'
      }} 
    >
      {/* 1. Icon Mở rộng */}
      <div className="w-6 h-6 flex items-center justify-center shrink-0 -ml-1">
        {isGroup ? (
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-gray-400 hover:text-gray-700">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        ) : null}
      </div>

      {/* 2. Mã số */}
      <span className={cn(
        "text-sm w-10 shrink-0", 
        isGroup ? "font-bold text-gray-700" : "font-medium text-gray-500"
      )}>
        {node.code}
      </span>

      {/* 3. Input Tên */}
      <Input 
        value={node.name} 
        onChange={(e) => onUpdate(node.id, 'name', e.target.value)}
        className={cn(
           "h-9 flex-1 border-transparent hover:border-gray-300 focus:border-blue-500 bg-transparent px-2 shadow-none",
           isGroup ? "font-bold text-gray-800" : "font-medium text-gray-900"
        )}
        placeholder={isGroup ? "Tên nhóm công việc..." : "Tên đầu việc..."}
      />

      {/* 4. Select Người */}
      <div className="w-[200px] shrink-0">
        <Select value={node.assigneeId || ''} onValueChange={(val) => onUpdate(node.id, 'assigneeId', val)}>
          <SelectTrigger className="h-9 border-transparent hover:border-gray-300 bg-transparent px-2 shadow-none">
             {selectedUser ? (
                <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-[9px] font-bold">{selectedUser.initials}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm text-gray-700">{selectedUser.name}</span>
                </div>
             ) : <span className="text-gray-400 text-sm">Chọn người...</span>}
          </SelectTrigger>
          <SelectContent>
            {users.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 5. DEADLINE - ĐÃ SỬA THÀNH DATE PICKER */}
      <div className="w-[110px] shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"ghost"}
                className={cn(
                  "h-9 w-full justify-start text-left font-normal px-2 hover:bg-transparent hover:border-gray-300 border border-transparent shadow-none",
                  !node.deadline && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3 opacity-50" />
                <span className="text-sm text-gray-600 truncate">
                    {node.deadline ? node.deadline : <span className="text-xs text-gray-400">Chọn ngày</span>}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                    // Khi chọn ngày, convert ngược về chuỗi "dd/MM/yyyy" để lưu
                    const dateString = date ? format(date, "dd/MM/yyyy") : "";
                    onUpdate(node.id, 'deadline', dateString);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
      </div>

      {/* 6. Độ tin cậy */}
      <div className="w-[80px] shrink-0 text-right pr-2">
          <span className={cn("font-bold text-sm", node.confidence >= 80 ? "text-green-600" : "text-orange-500")}>
              {node.confidence}%
          </span>
      </div>

      {/* 7. Menu Xóa */}
      <div className="w-[40px] shrink-0 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 opacity-0 group-hover:opacity-100 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => onDelete(node.id)}>
              <Trash className="mr-2 h-4 w-4" /> Xóa {isGroup ? 'nhóm này' : 'dòng này'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (!isGroup) return RowContent;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      {RowContent}
      <CollapsibleContent>
        {node.children?.map((child) => (
            <PlanEditorRow 
                key={child.id} 
                node={child} 
                isGroup={false}
                users={users} 
                onUpdate={onUpdate} 
                onAddChild={() => {}}
                onDelete={onDelete}
            />
        ))}
        <div className="pl-[48px] py-1 border-b border-dashed border-gray-100 hover:bg-gray-50">
            <Button 
                variant="ghost" 
                className="h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 gap-2 text-sm font-normal px-2"
                onClick={() => onAddChild(node.id)}
            >
                <Plus className="h-3 w-3" />
                Thêm đầu việc
            </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}