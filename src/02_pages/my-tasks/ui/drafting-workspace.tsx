import { Task } from "@/entities/task";
import { Button } from "@/shared/ui/button";
import { Send, Save } from "lucide-react";

export const DraftingWorkspace = ({ task }: { task: Task }) => {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b px-6 py-4 flex justify-between items-center bg-white">
        <div>
           <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Drafting Task</span>
           <h2 className="text-xl font-bold text-slate-900 mt-1">{task.taskName}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Save className="w-4 h-4 mr-2"/> Lưu nháp</Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700"><Send className="w-4 h-4 mr-2"/> Gửi duyệt</Button>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex justify-center">
        <div className="w-full max-w-4xl bg-white shadow-lg min-h-[800px] p-12 rounded-sm border border-slate-200">
           {/* Mock Editor Area */}
           <div className="outline-none text-slate-800 leading-relaxed" contentEditable suppressContentEditableWarning>
              <h1 className="text-2xl font-bold mb-4">THUYẾT MINH KỸ THUẬT</h1>
              <p className="italic text-slate-400 mb-6">[Bắt đầu soạn thảo nội dung tại đây...]</p>
              <p>Căn cứ vào yêu cầu của hồ sơ mời thầu...</p>
           </div>
        </div>
      </div>
    </div>
  );
};