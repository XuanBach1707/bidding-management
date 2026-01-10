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
  /** [THÊM] Prop để báo hiệu validate lỗi */
  error?: boolean; 
}

export const AssigneeSelect = ({
  unitId,
  value,
  onChange,
  disabled,
  className = "",
  placeholder = "-- Chọn NV --",
  error = false, // Mặc định là không lỗi
}: AssigneeSelectProps) => {
  const { members, isLoading } = useUnitMembers(unitId);
  
  const isDisabled = disabled || isLoading || !unitId;
  const selectValue = value ? String(value) : undefined;

  const handleValueChange = (val: string) => {
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
            "w-full h-9 bg-white border-slate-200 text-slate-900 transition-all focus:ring-[#009d98] focus:border-[#009d98]",
            // [SỬA] Hiển thị viền đỏ nếu error = true và chưa chọn giá trị
            error && !value && "border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500",
            isDisabled && "bg-slate-100 text-slate-400 opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
               <Loader2 className="h-3 w-3 animate-spin" />
               <span>Đang tải...</span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        
        <SelectContent>
          {/* Bỏ mục "unassigned" nếu bạn muốn ép người dùng PHẢI chọn một ai đó */}
          {/* Hoặc giữ lại nhưng đổi text để họ biết đây là lựa chọn trống */}
          <SelectItem value="unassigned" className="text-slate-400 italic">
            {placeholder}
          </SelectItem>

          {members?.map((member) => (
            <SelectItem key={member.userId} value={String(member.userId)}>
              <div className="flex flex-col text-left">
                <span className="font-medium">{member.fullName}</span>
                {member.jobTitle && (
                  <span className="text-[10px] text-slate-500 font-normal leading-tight">
                    {member.jobTitle}
                  </span>
                )}
              </div>
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