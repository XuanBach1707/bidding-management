import { useState } from "react";
import { 
  ArrowLeft, Save, Loader2, 
  Code, MonitorPlay, AlertTriangle 
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
  const [viewMode, setViewMode] = useState<ViewMode>("CODE"); // Mặc định vào Code cho Dev

  return (
    <div className="flex flex-col h-full bg-slate-100">
       {/* Toolbar */}
       <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
          {/* Left: Back & Toggle Mode */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack} className="gap-2 text-slate-600 border-slate-200 hover:text-[#009d98] hover:border-[#009d98]">
                <ArrowLeft className="w-4 h-4" /> Quay lại
            </Button>
            
            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                    onClick={() => setViewMode("CODE")}
                    className={`text-xs font-bold flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${viewMode === 'CODE' ? 'bg-white shadow text-[#009d98]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Code className="w-3.5 h-3.5" /> HTML Source
                </button>
                <button 
                    onClick={() => setViewMode("PREVIEW")}
                    className={`text-xs font-bold flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${viewMode === 'PREVIEW' ? 'bg-white shadow text-[#009d98]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <MonitorPlay className="w-3.5 h-3.5" /> Live Preview
                </button>
            </div>
          </div>
          
          {/* Right: Save */}
          <div className="flex items-center gap-4">
             {viewMode === "CODE" && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Chế độ Developer (Cẩn thận khi sửa tag)
                </div>
             )}
             <Button size="sm" onClick={() => onSave(content)} disabled={isSaving} className="bg-[#009d98] hover:bg-[#008580] text-white font-bold shadow-sm gap-2 min-w-[110px]">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "Đang lưu..." : "Lưu Code"}
             </Button>
          </div>
       </div>

       {/* Editor Area */}
       <div className="flex-1 overflow-hidden relative">
          {viewMode === "CODE" ? (
              <div className="w-full h-full flex flex-col">
                  <div className="bg-[#1e1e1e] text-slate-400 text-xs px-4 py-2 border-b border-slate-700 flex justify-between font-mono">
                      <span>source.html</span>
                      <span>UTF-8</span>
                  </div>
                  <Textarea 
                      className="flex-1 w-full h-full border-none focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed resize-none bg-[#1e1e1e] text-[#d4d4d4] selection:bg-[#264f78]" 
                      placeholder="" 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      spellCheck={false}
                  />
              </div>
          ) : (
              <div className="w-full h-full bg-slate-200/50 flex justify-center overflow-auto p-8 relative">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1 rounded-full opacity-70 pointer-events-none z-10">
                      Chế độ xem trước (A4)
                  </div>
                  {/* Iframe mô phỏng khổ giấy A4 */}
                  <iframe 
                      title="Document Preview"
                      srcDoc={injectPreviewScript(content)} 
                      className="w-[210mm] min-h-[297mm] bg-white shadow-2xl origin-top transition-transform mb-20"
                      style={{ border: 'none' }}
                  />
              </div>
          )}
       </div>
    </div>
  );
};