import { Task } from "@/entities/task";
import { Textarea } from "@/shared/ui/textarea";

export const DraftingEditor = ({ task }: { task: Task }) => {
  return (
    <div className="max-w-4xl mx-auto">
       <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">Soạn thảo nội dung</h3>
          <Textarea 
            className="min-h-[400px]" 
            placeholder="Nhập nội dung báo cáo hoặc công việc tại đây..." 
          />
       </div>
    </div>
  );
};