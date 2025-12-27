import { useUnitMembers } from "../model/use-unit-members";

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
  const isDisabled = disabled || isLoading || !unitId;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const val = event.target.value;
    // Nếu value rỗng thì trả về null, ngược lại parse number
    onChange(val ? Number(val) : null);
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={value || ""}
        onChange={handleChange}
        disabled={isDisabled}
        className={`
          flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50
          ${isDisabled ? "bg-gray-100 text-gray-400" : "bg-white text-gray-900"}
        `}
      >
        <option value="">{isLoading ? "Đang tải..." : placeholder}</option>
        
        {members.map((member) => (
          <option key={member.userId} value={member.userId}>
            {member.fullName} {member.jobTitle ? `- ${member.jobTitle}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
};