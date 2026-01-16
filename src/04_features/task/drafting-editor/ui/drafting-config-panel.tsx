import { useEffect, useState } from "react";
import { 
  Sparkles, Loader2, Database, 
  MessageSquare, CheckSquare, Square, FileText
} from "lucide-react";

import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { useToast } from "@/shared/lib/hooks/use-toast";

// Entities
import { DraftMetadata } from "../api/drafting-api";
import { aiDraftingApi } from "@/entities/ai-drafting";

interface DraftingConfigPanelProps {
  // Giữ lại props để tương thích interface cha
  defaultValues?: DraftMetadata; 
  onMetadataChange: (values: DraftMetadata) => void;
  onAiGenerated: (htmlContent: string) => void;
  taskProjectName?: string;
}

// Prompt mẫu (Chỉ để hiển thị Demo)
const MOCK_PROMPTS = [
  "Văn phong trang trọng",
  "Tập trung vào tiến độ",
  "Quy định phạt chậm tiến độ",
  "Yêu cầu bảo mật cao",
  "Tóm tắt các mốc quan trọng"
];

// --- HELPER: CONVERT MARKDOWN TO HTML (MVP VERSION) ---
const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return "";

  // 1. Xóa bỏ code block markers nếu có
  let html = markdown.trim()
    .replace(/^```markdown\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // 2. Convert Headers (phải xử lý từ H3 → H1 để tránh conflict)
  html = html
    .replace(/^#### (.*$)/gim, '<h4 style="font-size: 1em; font-weight: 600; margin: 1em 0 0.5em 0; color: #1e293b;">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.1em; font-weight: 700; margin: 1.2em 0 0.6em 0; color: #0f172a;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.3em; font-weight: 700; margin: 1.5em 0 0.8em 0; color: #0f172a;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.6em; font-weight: 800; margin: 0 0 1em 0; color: #020617; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">$1</h1>');

  // 3. Convert Bold (**text**) và Italic (*text*)
  html = html
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')  // Bold + Italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')                 // Bold
    .replace(/\*(.+?)\*/g, '<em>$1</em>');                            // Italic

  // 4. Convert Lists với style đẹp hơn
  // Wrap các <li> liên tiếp vào <ul>
  const lines = html.split('\n');
  const processed: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Nếu là list item
    if (line.match(/^- (.+)/)) {
      const content = line.replace(/^- (.+)/, '$1');

      if (!inList) {
        processed.push('<ul style="margin: 0.8em 0; padding-left: 1.5em; list-style-type: disc;">');
        inList = true;
      }
      processed.push(`<li style="margin: 0.3em 0; line-height: 1.6;">${content}</li>`);
    } else {
      // Nếu không phải list item mà đang trong list → đóng list
      if (inList) {
        processed.push('</ul>');
        inList = false;
      }
      processed.push(line);
    }
  }

  // Đóng list nếu còn mở
  if (inList) {
    processed.push('</ul>');
  }

  html = processed.join('\n');

  // 5. Convert Numbered Lists (1. text, 2. text)
  html = html.replace(/^(\d+)\.\s+(.+)$/gim, '<li style="margin: 0.3em 0; line-height: 1.6;">$2</li>');

  // 6. Convert Paragraphs (dòng trống = ngắt đoạn)
  // Thay 2+ newlines → </p><p>
  html = html
    .split(/\n\s*\n/)
    .map(para => para.trim())
    .filter(para => para.length > 0)
    .map(para => {
      // Không wrap <p> nếu đã là heading hoặc list
      if (para.match(/^<(h[1-6]|ul|ol|li)/i)) {
        return para;
      }
      return `<p style="margin: 0.8em 0; line-height: 1.7; text-align: justify;">${para}</p>`;
    })
    .join('\n');

  // 7. Wrap toàn bộ trong div với typography styles
  html = `<div style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; font-size: 14px; color: #334155; max-width: 100%; padding: 1em;">${html}</div>`;

  return html;
};

export const DraftingConfigPanel = ({ 
  onAiGenerated,
  taskProjectName
}: DraftingConfigPanelProps) => {
  const { toast } = useToast();

  // --- STATE ---
  
  // State Mock Prompt (Chỉ để UI tương tác)
  const [mockPromptInput, setMockPromptInput] = useState(""); 
  
  // State File RAG (Logic thật)
  const FIXED_COLLECTION = "bidding_docs";
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); 
  
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Load Files từ 'bidding_docs' khi Mount
  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoadingFiles(true);
      try {
        const res = await aiDraftingApi.getCollectionFiles(FIXED_COLLECTION);
        const files = res.files || [];
        setAvailableFiles(files);
        setSelectedFiles(files); // Mặc định chọn tất cả
      } catch (error) {
        console.error("Load files error:", error);
      } finally {
        setIsLoadingFiles(false);
      }
    };
    fetchFiles();
  }, []);

  // Handler: Toggle chọn file
  const toggleFile = (fileName: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileName) 
        ? prev.filter(f => f !== fileName) 
        : [...prev, fileName]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === availableFiles.length) {
      setSelectedFiles([]); 
    } else {
      setSelectedFiles(availableFiles); 
    }
  };

  // Handler: Mock click chip
  const handleMockSampleClick = (text: string) => {
    setMockPromptInput(prev => (prev ? `${prev}\n- ${text}` : `- ${text}`));
  };

  // 2. Generate Content (Logic chính)
  const handleGenerate = async () => {
    if (!taskProjectName) {
      toast({ variant: "destructive", title: "Thiếu tên dự án", description: "Vui lòng chọn một Task cụ thể." });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({ variant: "destructive", title: "Thiếu tài liệu", description: "Vui lòng chọn ít nhất 1 tài liệu tham chiếu." });
      return;
    }

    setIsGenerating(true);
    try {
      // Gọi API (Chỉ truyền projectName và referenceDoc)
      const res = await aiDraftingApi.generateContent({
        projectName: taskProjectName,
        referenceDoc: selectedFiles
      });
      
      console.log("AI Response:", res); // Debug

      // Xử lý kết quả trả về
      // API trả về Object: { status, project, used_template, data }
      if (res && res.data) {
          // Convert Markdown sang HTML
          const htmlContent = convertMarkdownToHtml(res.data);
          
          // Đẩy HTML ra ngoài cho Editor
          onAiGenerated(htmlContent);
          
          toast({ 
            title: "Đã tạo nội dung", 
            description: `Tham chiếu từ mẫu: ${res.used_template}`,
            className: "bg-[#009d98] text-white" 
          });
      } else {
          toast({ variant: "destructive", title: "Lỗi dữ liệu", description: "API không trả về nội dung hợp lệ." });
      }

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi AI", description: "Không thể kết nối tới Agent." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-[320px] shrink-0">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wide mb-2">
           <Sparkles className="w-4 h-4 text-purple-600" /> AI Drafting Agent
        </h4>
        <div className="text-xs text-slate-500 line-clamp-2 font-medium bg-white p-2 rounded border border-slate-200">
           Dự án: <span className="text-[#009d98] font-bold">{taskProjectName || "..."}</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          {/* KHU VỰC 1: MOCK PROMPT (Giữ lại giao diện nhưng không logic) */}
          <div className="space-y-3">
             <Label className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Chỉ dẫn bổ sung (Tùy chọn)
             </Label>
             
             <Textarea 
                placeholder="Nhập các yêu cầu cụ thể cho AI (Ví dụ: Giọng văn, các điểm cần lưu ý...)"
                className="min-h-[80px] text-sm resize-none bg-slate-50 border-slate-200 focus-visible:ring-[#009d98]"
                value={mockPromptInput}
                onChange={(e) => setMockPromptInput(e.target.value)}
             />

             {/* Mock Chips */}
             <div className="flex flex-wrap gap-2">
                {MOCK_PROMPTS.map((sample) => (
                   <Badge 
                      key={sample} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-[#009d98] hover:text-white hover:border-[#009d98] transition-all font-normal text-[10px] text-slate-500 bg-white"
                      onClick={() => handleMockSampleClick(sample)}
                   >
                      + {sample}
                   </Badge>
                ))}
             </div>
          </div>

          <div className="h-px bg-slate-100 mx-2" />

          {/* KHU VỰC 2: RAG CONTEXT (Logic chính) */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                   <Database className="w-3.5 h-3.5" /> Tài liệu tham chiếu
                </Label>
                <div 
                   className="text-[10px] text-[#009d98] cursor-pointer hover:underline font-bold flex items-center gap-1"
                   onClick={toggleSelectAll}
                >
                   {selectedFiles.length === availableFiles.length ? (
                      <><CheckSquare className="w-3 h-3"/> Bỏ chọn tất cả</>
                   ) : (
                      <><Square className="w-3 h-3"/> Chọn tất cả</>
                   )}
                </div>
             </div>
             
             {/* List Files */}
             <div className="border border-slate-200 rounded-md bg-white overflow-hidden">
                {isLoadingFiles ? (
                   <div className="p-4 flex items-center justify-center text-slate-400 gap-2 text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" /> Đang tải từ {FIXED_COLLECTION}...
                   </div>
                ) : availableFiles.length > 0 ? (
                   <div className="max-h-[250px] overflow-y-auto p-1 space-y-0.5">
                      {availableFiles.map((file) => {
                         const isSelected = selectedFiles.includes(file);
                         return (
                            <div 
                               key={file} 
                               className={`flex items-start gap-2 p-2 rounded cursor-pointer text-xs transition-colors ${isSelected ? 'bg-[#009d98]/5' : 'hover:bg-slate-50'}`}
                               onClick={() => toggleFile(file)}
                            >
                               <div className={`mt-0.5 w-3.5 h-3.5 border rounded flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#009d98] border-[#009d98]' : 'border-slate-300 bg-white'}`}>
                                  {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
                               </div>
                               <span className={`break-all leading-tight ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                                  {file}
                               </span>
                            </div>
                         );
                      })}
                   </div>
                ) : (
                   <div className="p-4 text-center text-xs text-slate-400 italic">
                      Không có file nào trong {FIXED_COLLECTION}
                   </div>
                )}
             </div>
             
             <div className="text-[10px] text-slate-400 text-right">
                Đã chọn: {selectedFiles.length}/{availableFiles.length} tài liệu
             </div>
          </div>

        </div>
      </ScrollArea>

      {/* FOOTER ACTION */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
         <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-md h-10"
            onClick={handleGenerate}
            disabled={isGenerating || !taskProjectName}
         >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {isGenerating ? "Agent đang viết..." : "Tạo dự thảo chương 1"}
         </Button>
      </div>
    </div>
  );
};