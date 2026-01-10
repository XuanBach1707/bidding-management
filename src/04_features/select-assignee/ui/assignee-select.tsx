import { useUnitMembers } from "../model/use-unit-members";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";

interface AssigneeSelectProps {
  unitId?: number | null;
  value?: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const AssigneeSelect = ({
  unitId,
  value,
  onChange,
  disabled,
  className = "",
  placeholder = "-- Chọn NV --",
}: AssigneeSelectProps) => {
  const { members, isLoading } = useUnitMembers(unitId);
  
  // Logic disable: Khi disabled từ prop, đang load, hoặc chưa có unitId
  const isDisabled = disabled || isLoading || !unitId;

  // Xử lý chuyển đổi value (Select của Shadcn chỉ nhận string)
  const selectValue = value ? String(value) : undefined;

  const handleValueChange = (val: string) => {
    // Nếu chọn mục "unassigned" hoặc rỗng -> trả về null
    if (val === "unassigned" || !val) {
      onChange(null);
    } else {
      onChange(Number(val));
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Select
        value={selectValue}
        onValueChange={handleValueChange}
        disabled={isDisabled}
      >
        <SelectTrigger 
          className={cn(
            "w-full h-9 bg-white border-slate-200 text-slate-900 focus:ring-[#009d98] focus:border-[#009d98]",
            isDisabled && "bg-slate-100 text-slate-400 opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
               <Loader2 className="h-3 w-3 animate-spin" />
               <span>Đang tải nhân sự...</span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        
        <SelectContent>
          {/* Item mặc định để bỏ chọn */}
          <SelectItem value="unassigned" className="text-slate-400 italic">
            {placeholder}
          </SelectItem>

          {members?.map((member) => (
            <SelectItem key={member.userId} value={String(member.userId)}>
              <span className="font-medium">{member.fullName}</span>
              {member.jobTitle && (
                <span className="text-slate-400 ml-1 text-xs font-normal">
                   - {member.jobTitle}
                </span>
              )}
            </SelectItem>
          ))}
          
          {members.length === 0 && !isLoading && (
             <div className="p-2 text-xs text-center text-slate-400">Không có nhân sự</div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};