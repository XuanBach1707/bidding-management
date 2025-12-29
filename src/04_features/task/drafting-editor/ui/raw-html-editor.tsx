// src/features/task/drafting-editor/ui/raw-html-editor.tsx
import { useState } from "react";
import { 
  ArrowLeft, Save, Loader2, 
  Code, MonitorPlay 
} from "lucide-react";

// Shared UI
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

interface RawHtmlEditorProps {
  initialContent: string; // Full HTML String
  onBack: () => void;
  onSave: (content: string) => void;
  isSaving?: boolean;
}

type ViewMode = "PREVIEW" | "CODE";

// Script inject vào Iframe để fix lỗi bấm link bị reload trang
const injectPreviewScript = (htmlContent: string) => {
  const script = `
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
               const targetElement = document.querySelector(targetId);
               if (targetElement) {
                 targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
               }
            }
          });
        });
      });
    </script>
  `;
  if (htmlContent.includes("</body>")) {
    return htmlContent.replace("</body>", `${script}</body>`);
  }
  return htmlContent + script;
};

export const RawHtmlEditor = ({ initialContent, onBack, onSave, isSaving }: RawHtmlEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<ViewMode>("PREVIEW");

  return (
    <div className="flex flex-col h-full bg-slate-100/50">
       {/* Toolbar */}
       <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm sticky top-0 z-30">
          {/* Left: Back & Toggle Mode */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-slate-600">
                <ArrowLeft className="w-4 h-4" /> Quay lại
            </Button>
            
            <div className="h-4 w-[1px] bg-slate-200"></div>

            <div className="flex bg-slate-100 p-1 rounded-md">
                <button 
                    onClick={() => setViewMode("PREVIEW")}
                    className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all ${viewMode === 'PREVIEW' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <MonitorPlay className="w-3.5 h-3.5" /> Xem trước
                </button>
                <button 
                    onClick={() => setViewMode("CODE")}
                    className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all ${viewMode === 'CODE' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Code className="w-3.5 h-3.5" /> HTML Code
                </button>
            </div>
          </div>
          
          {/* Right: Save */}
          <div className="flex items-center gap-2">
             <span className="text-xs text-slate-400 italic mr-2">Chế độ nâng cao (Developer)</span>
             <Button size="sm" onClick={() => onSave(content)} disabled={isSaving} className="bg-blue-600 gap-2 min-w-[100px]">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "Đang lưu..." : "Lưu lại"}
             </Button>
          </div>
       </div>

       {/* Editor Area */}
       <div className="flex-1 overflow-hidden relative p-4">
          <div className="bg-white border rounded-lg shadow-sm w-full h-full flex flex-col overflow-hidden">
            {viewMode === "CODE" ? (
                <>
                    <div className="p-2 px-4 border-b bg-slate-900 text-slate-400 flex justify-between items-center shrink-0">
                        <span className="text-[10px] font-mono">source_code.html</span>
                    </div>
                    <Textarea 
                        className="flex-1 border-none focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed resize-none bg-slate-900 text-slate-50" 
                        placeholder="Nhập mã HTML..." 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        spellCheck={false}
                    />
                </>
            ) : (
                <div className="w-full h-full bg-slate-200/50 flex justify-center overflow-auto p-8">
                    {/* Iframe mô phỏng khổ giấy A4 */}
                    <iframe 
                        title="Document Preview"
                        srcDoc={injectPreviewScript(content)} 
                        className="w-[210mm] min-h-[297mm] bg-white shadow-lg origin-top transition-transform"
                        style={{ border: 'none' }}
                    />
                </div>
            )}
          </div>
       </div>
    </div>
  );
};