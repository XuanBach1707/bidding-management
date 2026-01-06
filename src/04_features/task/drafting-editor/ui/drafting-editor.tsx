"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Plus, FileText, ChevronRight, ArrowLeft, Save, 
  Loader2, Code, MonitorPlay, FileType, History, Sparkles,
  FileDown 
} from "lucide-react";

import { asBlob } from "html-docx-js-typescript";
import { saveAs } from "file-saver";

import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; 

import { Task } from "@/entities/task";
import { Template, templateApi } from "@/entities/template";
import { draftingApi } from "../api/drafting-api";

import { parseHtmlToEditorData, mergeHtmlFromEditorData } from "../lib/html-processor"; 
import { RichTextEditor } from "./rich-text-editor"; 
import { AiAssistant } from "./ai-assistant"; 

interface DraftingEditorProps {
  task: Task;
  isReadOnly?: boolean; // [MỚI] Prop để bật chế độ xem
}

type Step = "SELECT" | "EDITOR";
type EditorMode = "RICH_TEXT" | "RAW_HTML"; 
type ViewMode = "PREVIEW" | "CODE";        

// --- HELPER 1: Inject Script cho Preview ---
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
  if (htmlContent.includes("</body>")) return htmlContent.replace("</body>", `${script}</body>`);
  return htmlContent + script;
};

// --- HELPER 2: Wrap HTML cho Word ---
const wrapHtmlForWord = (htmlContent: string) => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        td, th { border: 1px solid black; padding: 5px; }
        .page-break { page-break-after: always; }
        img { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;
};

// --- MAIN COMPONENT ---
export const DraftingEditor = ({ task, isReadOnly = false }: DraftingEditorProps) => {
  const { toast } = useToast();
  
  // --- STATE ---
  // Nếu là ReadOnly -> Vào thẳng Editor, bỏ qua bước Select
  const [step, setStep] = useState<Step>(isReadOnly ? "EDITOR" : "SELECT");
  const [editorMode, setEditorMode] = useState<EditorMode>("RICH_TEXT"); 
  const [viewMode, setViewMode] = useState<ViewMode>("CODE");
  
  const [fullHtmlContent, setFullHtmlContent] = useState("");
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false); 

  const [isAiOpen, setIsAiOpen] = useState(false);

  // --- LOGIC ---
  const parsedData = useMemo(() => {
    return parseHtmlToEditorData(fullHtmlContent);
  }, [fullHtmlContent]);

  // --- EFFECT ---
  // 1. Tự động load draft khi ở chế độ ReadOnly
  useEffect(() => {
    if (isReadOnly && step === "EDITOR") {
        const autoLoad = async () => {
            setIsLoadingDraft(true);
            try {
                const content = await draftingApi.loadDraft(task.id);
                if (content) setFullHtmlContent(content);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoadingDraft(false);
            }
        };
        autoLoad();
    }
  }, [isReadOnly, step, task.id]);

  // 2. Load templates (Chỉ khi không phải ReadOnly)
  useEffect(() => {
    if (!isReadOnly && step === "SELECT") {
        const fetchTemplates = async () => {
        try {
            setIsLoadingTemplates(true);
            const data = await templateApi.getList();
            setTemplates(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không tải được danh sách mẫu." });
        } finally {
            setIsLoadingTemplates(false);
        }
        };
        fetchTemplates();
    }
  }, [isReadOnly, step, toast]);

  // --- HANDLERS ---
  const handleSelectTemplate = (tplContent: string) => {
    setFullHtmlContent(tplContent);
    setStep("EDITOR");
    setEditorMode("RICH_TEXT"); 
  };

  const handleLoadDraft = async () => {
    setIsLoadingDraft(true);
    try {
      const content = await draftingApi.loadDraft(task.id);
      
      if (!content) {
        toast({ variant: "default", title: "Thông báo", description: "Chưa có bản nháp nào được lưu." });
        return;
      }

      setFullHtmlContent(content);
      setStep("EDITOR");
      setEditorMode("RICH_TEXT");
      toast({ title: "Đã tải bản nháp", description: "Tiếp tục chỉnh sửa..." });

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải bản nháp." });
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const handleSaveApi = async (contentToSave: string) => {
    if (isReadOnly) return; // Chặn save

    setIsSaving(true);
    try {
      await draftingApi.saveDraft(task.id, contentToSave);
      setFullHtmlContent(contentToSave);
      toast({ title: "Thành công", description: "Đã lưu bản nháp." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể lưu bản nháp." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRichTextSave = (newBody: string) => {
      if (isReadOnly) return; // Chặn save
      const cssToUse = parsedData.originalCss || "";
      const mergedHtml = mergeHtmlFromEditorData(cssToUse, newBody);
      handleSaveApi(mergedHtml);
  };

  const handleAiApplyChanges = (newHtml: string) => {
      if (isReadOnly) return; // Chặn AI apply
      setFullHtmlContent(newHtml);
      toast({ title: "AI Assistant", description: "Dữ liệu đã được điền tự động!" });
  };

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      const htmlString = wrapHtmlForWord(fullHtmlContent);
      const blob = await asBlob(htmlString, {
        orientation: 'portrait',
        margins: { top: 720, right: 720, bottom: 720, left: 720 },
      });
      const fileName = `${task.taskName || "Tai-lieu-HS"}.docx`;
      saveAs(blob as Blob, fileName);
      toast({ title: "Thành công", description: "Đã tải xuống file Word." });
    } catch (error) {
      console.error("Export error:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể xuất file Word." });
    } finally {
      setIsExporting(false);
    }
  };

  // --- RENDER 1: SELECT ---
  // Nếu là ReadOnly thì không bao giờ vào bước này (đã set ở useState)
  if (step === "SELECT" && !isReadOnly) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Chọn nguồn soạn thảo</h3>
          <p className="text-slate-500 text-sm">
             Bắt đầu từ mẫu mới hoặc tiếp tục bản nháp cũ cho <strong>{task.taskName}</strong>.
          </p>
        </div>

        <Tabs defaultValue="template" className="w-full">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
                <TabsTrigger value="template">Mẫu văn bản</TabsTrigger>
                <TabsTrigger value="draft">Bản nháp đã lưu</TabsTrigger>
            </TabsList>

            <TabsContent value="template">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    onClick={() => handleSelectTemplate("")}
                    className="cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[180px] hover:border-blue-500 hover:bg-blue-50 transition-all bg-white"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-700">Tạo văn bản trống</h4>
                  </div>

                  {isLoadingTemplates ? (
                    <div className="col-span-2 flex items-center justify-center h-[180px] text-slate-400 italic gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Đang tải mẫu...
                    </div>
                  ) : templates.map((tpl) => (
                    <div 
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl.content)}
                      className="group cursor-pointer border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-500 transition-all bg-white flex flex-col min-h-[180px] relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 font-normal">{tpl.category}</Badge>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-2 text-sm line-clamp-2 group-hover:text-blue-700">{tpl.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">{tpl.description}</p>
                      <div className="flex items-center text-blue-600 text-xs font-medium mt-auto group-hover:translate-x-1 transition-transform">
                        Sử dụng mẫu <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  ))}
                </div>
            </TabsContent>

            <TabsContent value="draft">
               <div className="border border-slate-200 rounded-xl p-10 bg-white flex flex-col items-center justify-center text-center min-h-[300px]">
                  <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
                      <History className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Tiếp tục công việc</h3>
                  <p className="text-slate-500 max-w-md mb-6 text-sm">
                    Hệ thống sẽ tải lại nội dung bản nháp gần nhất mà bạn đã lưu.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={handleLoadDraft} 
                    disabled={isLoadingDraft}
                    className="bg-orange-600 hover:bg-orange-700 min-w-[200px]"
                  >
                     {isLoadingDraft ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                     {isLoadingDraft ? "Đang tải dữ liệu..." : "Mở bản nháp"}
                  </Button>
               </div>
            </TabsContent>
        </Tabs>
      </div>
    );
  }

  // --- RENDER 2: EDITOR ---
  return (
    <div className="relative">
        <div 
            className="max-w-6xl mx-auto animate-in slide-in-from-bottom-2 duration-300 transition-all ease-in-out"
            style={{ marginRight: isAiOpen ? "400px" : "0" }}
        >
            {/* HEADER & TOOLBAR */}
            <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-lg border shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    {/* [MỚI] Ẩn nút Back nếu ReadOnly */}
                    {!isReadOnly && (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => setStep("SELECT")} className="text-slate-600 gap-2 hover:text-slate-900">
                                <ArrowLeft className="w-4 h-4" /> Chọn mẫu khác
                            </Button>
                            <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
                        </>
                    )}
                    
                    <div className="flex bg-slate-100 p-1 rounded-md">
                        <button 
                            onClick={() => setEditorMode("RICH_TEXT")}
                            className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all ${editorMode === 'RICH_TEXT' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FileType className="w-3.5 h-3.5" /> Soạn thảo
                        </button>
                        <button 
                            onClick={() => {
                                setEditorMode("RAW_HTML");
                                setViewMode("CODE");
                            }}
                            className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all ${editorMode === 'RAW_HTML' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Code className="w-3.5 h-3.5" /> HTML Code
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* [MỚI] Ẩn nút AI nếu ReadOnly */}
                    {!isReadOnly && (
                        <Button 
                            size="sm" 
                            variant={isAiOpen ? "secondary" : "default"}
                            onClick={() => setIsAiOpen(!isAiOpen)} 
                            className={`gap-2 shadow-sm transition-all ${isAiOpen ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                        >
                            <Sparkles className="w-4 h-4" /> AI Trợ lý
                        </Button>
                    )}

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleExportDocx} 
                      disabled={isExporting}
                      className="gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                        Xuất Word
                    </Button>

                    {/* [MỚI] Ẩn nút Lưu nếu ReadOnly */}
                    {!isReadOnly && editorMode === "RAW_HTML" && (
                        <Button size="sm" onClick={() => handleSaveApi(fullHtmlContent)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 gap-2 min-w-[100px]">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? "Đang lưu..." : "Lưu lại"}
                        </Button>
                    )}
                </div>
            </div>

            {/* --- AREA 1: RICH TEXT EDITOR --- */}
            {editorMode === "RICH_TEXT" && (
                <>
                    {/* Ẩn Alert hướng dẫn soạn thảo nếu ReadOnly */}
                    {!isReadOnly && (
                        <Alert className="bg-blue-50 border-blue-100 py-2 mb-4">
                            <AlertDescription className="text-xs text-blue-700">
                            Đang soạn thảo trực quan. Bấm <strong>Lưu lại</strong> để cập nhật thay đổi.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="bg-white border rounded-lg shadow-sm overflow-hidden min-h-[600px]">
                        {/* Lưu ý: Nếu RichTextEditor chưa hỗ trợ prop disabled/readOnly,
                            bạn có thể bọc nó trong 1 div có style {{ pointerEvents: "none", opacity: 0.8 }}
                            nhưng tốt nhất là sửa RichTextEditor để nhận prop. */}
                        <div style={isReadOnly ? { pointerEvents: "none" } : {}}>
                            <RichTextEditor 
                                initialContent={parsedData.bodyContent} 
                                css={parsedData.editorCss}             
                                onBack={() => setStep("SELECT")}
                                onSave={handleRichTextSave}             
                                isSaving={isSaving}
                                // Giả sử RichTextEditor của bạn chưa có prop readOnly, ta dùng CSS pointer-events để chặn click
                            />
                        </div>
                    </div>
                </>
            )}

            {/* --- AREA 2: RAW HTML EDITOR --- */}
            {editorMode === "RAW_HTML" && (
                <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)] min-h-[600px]">
                    <div className="p-2 border-b bg-slate-50 flex justify-end gap-2">
                        <Button 
                            variant="ghost" size="sm" 
                            onClick={() => setViewMode("PREVIEW")}
                            className={viewMode === "PREVIEW" ? "bg-slate-200" : ""}
                        >
                            <MonitorPlay className="w-3.5 h-3.5 mr-1" /> Xem trước
                        </Button>
                        <Button 
                            variant="ghost" size="sm" 
                            onClick={() => setViewMode("CODE")}
                            className={viewMode === "CODE" ? "bg-slate-200" : ""}
                        >
                            <Code className="w-3.5 h-3.5 mr-1" /> Mã nguồn
                        </Button>
                    </div>

                    {viewMode === "CODE" ? (
                        <Textarea 
                            className="flex-1 border-none focus-visible:ring-0 p-6 font-mono text-sm leading-relaxed resize-none bg-slate-900 text-slate-50" 
                            placeholder="Nhập mã HTML..." 
                            value={fullHtmlContent}
                            onChange={(e) => setFullHtmlContent(e.target.value)}
                            spellCheck={false}
                            disabled={isReadOnly} // [MỚI] Disable textarea
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex justify-center overflow-auto p-8">
                            <iframe 
                            title="Preview"
                            srcDoc={injectPreviewScript(fullHtmlContent)} 
                            className="w-[210mm] min-h-[297mm] bg-white shadow-lg origin-top transition-transform"
                            style={{ border: 'none' }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* AI SIDEBAR: Ẩn luôn nếu ReadOnly */}
        {!isReadOnly && (
            <AiAssistant 
                isOpen={isAiOpen} 
                onClose={() => setIsAiOpen(false)} 
                currentHtml={fullHtmlContent}
                onApplyChanges={handleAiApplyChanges}
            />
        )}
    </div>
  );
};