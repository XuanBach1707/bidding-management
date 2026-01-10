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
import { cn } from "@/shared/lib/utils"; // Import cn

import { Task } from "@/entities/task";
import { Template, templateApi } from "@/entities/template";
import { draftingApi } from "../api/drafting-api";

import { parseHtmlToEditorData, mergeHtmlFromEditorData } from "../lib/html-processor"; 
import { RichTextEditor } from "./rich-text-editor"; 
import { AiAssistant } from "./ai-assistant"; 

interface DraftingEditorProps {
  task: Task;
  isReadOnly?: boolean; 
}

type Step = "SELECT" | "EDITOR";
type EditorMode = "RICH_TEXT" | "RAW_HTML"; 
type ViewMode = "PREVIEW" | "CODE";        

// --- HELPERS (Giữ nguyên) ---
const extractContentFromHtml = (fullHtml: string) => {
  if (!fullHtml) return "";
  if (!fullHtml.includes("<body")) return fullHtml;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(fullHtml, "text/html");
    return doc.body.innerHTML;
  } catch (e) {
    console.error("Lỗi parse HTML:", e);
    return fullHtml;
  }
};

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

  // Logic Parse
  const parsedData = useMemo(() => {
    const data = parseHtmlToEditorData(fullHtmlContent);
    return {
        ...data,
        bodyContent: extractContentFromHtml(fullHtmlContent) || ""
    };
  }, [fullHtmlContent]);

  // EFFECT: Auto load for ReadOnly
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

  // EFFECT: Load Templates
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

  // HANDLERS
  const handleSelectTemplate = (tplContent: string) => {
    setFullHtmlContent(tplContent || "<p></p>");
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
    if (isReadOnly) return;
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
      if (isReadOnly) return;
      const cssToUse = parsedData.originalCss || "";
      const mergedHtml = mergeHtmlFromEditorData(cssToUse, newBody);
      handleSaveApi(mergedHtml);
  };

  const handleAiApplyChanges = (newHtml: string) => {
      if (isReadOnly) return;
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

  // --- RENDER 1: SELECT (GIAO DIỆN CHỌN MẪU) ---
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
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6 bg-slate-100">
                <TabsTrigger value="template" className="data-[state=active]:bg-white data-[state=active]:text-[#009d98] font-bold">Mẫu văn bản</TabsTrigger>
                <TabsTrigger value="draft" className="data-[state=active]:bg-white data-[state=active]:text-[#009d98] font-bold">Bản nháp đã lưu</TabsTrigger>
            </TabsList>

            <TabsContent value="template">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card tạo mới */}
                  <div 
                    onClick={() => handleSelectTemplate("")}
                    className="cursor-pointer border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center min-h-[180px] hover:border-[#009d98] hover:bg-[#009d98]/5 transition-all bg-white group"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-400 group-hover:text-[#009d98] group-hover:bg-white border border-transparent group-hover:border-[#009d98]/20 transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-700 group-hover:text-[#009d98]">Tạo văn bản trống</h4>
                  </div>

                  {/* List mẫu */}
                  {isLoadingTemplates ? (
                    <div className="col-span-2 flex items-center justify-center h-[180px] text-slate-400 italic gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Đang tải mẫu...
                    </div>
                  ) : templates.map((tpl) => (
                    <div 
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl.content)}
                      className="group cursor-pointer border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-[#009d98] hover:ring-1 hover:ring-[#009d98]/20 transition-all bg-white flex flex-col min-h-[180px] relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded flex items-center justify-center group-hover:bg-[#009d98] group-hover:text-white transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 font-normal group-hover:bg-[#009d98]/10 group-hover:text-[#009d98]">{tpl.category}</Badge>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-2 text-sm line-clamp-2 group-hover:text-[#009d98]">{tpl.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">{tpl.description}</p>
                      <div className="flex items-center text-[#009d98] text-xs font-bold mt-auto opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        Sử dụng mẫu <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  ))}
                </div>
            </TabsContent>

            <TabsContent value="draft">
               <div className="border border-slate-200 rounded-xl p-10 bg-white flex flex-col items-center justify-center text-center min-h-[300px]">
                  <div className="w-16 h-16 bg-[#009d98]/10 text-[#009d98] rounded-full flex items-center justify-center mb-4">
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
                    className="bg-[#009d98] hover:bg-[#008580] min-w-[200px]"
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

  // --- RENDER 2: EDITOR (GIAO DIỆN SOẠN THẢO/XEM) ---
  return (
    <div className="relative">
        <div 
            className="max-w-6xl mx-auto animate-in slide-in-from-bottom-2 duration-300 transition-all ease-in-out"
            style={{ marginRight: isAiOpen ? "400px" : "0" }}
        >
            {/* TOOLBAR */}
            <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    {!isReadOnly && (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => setStep("SELECT")} className="text-slate-600 gap-2 hover:text-slate-900 hover:bg-slate-100">
                                <ArrowLeft className="w-4 h-4" /> Chọn mẫu khác
                            </Button>
                            <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
                        </>
                    )}
                    
                    <div className="flex bg-slate-100 p-1 rounded-md">
                        <button 
                            onClick={() => setEditorMode("RICH_TEXT")}
                            className={cn(
                                "text-xs flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all",
                                editorMode === 'RICH_TEXT' 
                                    ? 'bg-white shadow text-[#009d98] font-bold' 
                                    : 'text-slate-500 hover:text-slate-700'
                            )}
                        >
                            <FileType className="w-3.5 h-3.5" /> Soạn thảo
                        </button>
                        <button 
                            onClick={() => {
                                setEditorMode("RAW_HTML");
                                setViewMode("CODE");
                            }}
                            className={cn(
                                "text-xs flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all",
                                editorMode === 'RAW_HTML' 
                                    ? 'bg-white shadow text-[#009d98] font-bold' 
                                    : 'text-slate-500 hover:text-slate-700'
                            )}
                        >
                            <Code className="w-3.5 h-3.5" /> HTML Code
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {!isReadOnly && (
                        <Button 
                            size="sm" 
                            variant={isAiOpen ? "secondary" : "default"}
                            onClick={() => setIsAiOpen(!isAiOpen)} 
                            className={cn(
                                "gap-2 shadow-sm transition-all border",
                                isAiOpen 
                                    ? 'bg-[#009d98]/10 text-[#009d98] border-[#009d98]/20' 
                                    : 'bg-[#009d98] hover:bg-[#008580] text-white border-transparent'
                            )}
                        >
                            <Sparkles className="w-4 h-4" /> AI Trợ lý
                        </Button>
                    )}

                    <Button 
                      size="sm" variant="outline" onClick={handleExportDocx} disabled={isExporting}
                      className="gap-2 text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-[#009d98] hover:border-[#009d98]"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                        Xuất Word
                    </Button>

                    {!isReadOnly && editorMode === "RAW_HTML" && (
                        <Button size="sm" onClick={() => handleSaveApi(fullHtmlContent)} disabled={isSaving} className="bg-[#009d98] hover:bg-[#008580] gap-2 min-w-[100px]">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? "Đang lưu..." : "Lưu lại"}
                        </Button>
                    )}
                </div>
            </div>

            {/* AREA 1: RICH TEXT EDITOR */}
            {editorMode === "RICH_TEXT" && (
                <>
                    {!isReadOnly && (
                        <Alert className="bg-blue-50 border-blue-100 py-2 mb-4">
                            <AlertDescription className="text-xs text-blue-700">
                            Đang soạn thảo trực quan. Bấm <strong>Lưu lại</strong> để cập nhật thay đổi.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden min-h-[600px]">
                        <div style={isReadOnly ? { pointerEvents: "none", opacity: 1 } : {}}>
                            <RichTextEditor 
                                initialContent={parsedData.bodyContent} 
                                css={parsedData.editorCss}            
                                onBack={() => setStep("SELECT")}
                                onSave={handleRichTextSave}             
                                isSaving={isSaving}
                                isReadOnly={isReadOnly}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* AREA 2: RAW HTML EDITOR */}
            {editorMode === "RAW_HTML" && (
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)] min-h-[600px]">
                    <div className="p-2 border-b border-slate-200 bg-slate-50 flex justify-end gap-2">
                        <Button 
                            variant="ghost" size="sm" 
                            onClick={() => setViewMode("PREVIEW")}
                            className={viewMode === "PREVIEW" ? "bg-slate-200 text-slate-800" : "text-slate-500"}
                        >
                            <MonitorPlay className="w-3.5 h-3.5 mr-1" /> Xem trước
                        </Button>
                        <Button 
                            variant="ghost" size="sm" 
                            onClick={() => setViewMode("CODE")}
                            className={viewMode === "CODE" ? "bg-slate-200 text-slate-800" : "text-slate-500"}
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
                            disabled={isReadOnly}
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