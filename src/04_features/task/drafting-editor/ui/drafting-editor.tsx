"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Plus, FileText, ArrowLeft, Save, 
  Loader2, Code, FileType, FileDown, 
  Sparkles 
} from "lucide-react";

import { asBlob } from "html-docx-js-typescript";
import { saveAs } from "file-saver";

import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils";

// Entities
import { Task } from "@/entities/task";
import { Template, templateApi } from "@/entities/template";
import { draftingApi, DraftMetadata, SaveDraftPayload } from "../api/drafting-api";

// Feature Components
import { TemplateSelector } from "./template-selector";
import { RichTextEditor } from "./rich-text-editor";
import { RawHtmlEditor } from "./raw-html-editor";
import { AiAssistant } from "./ai-assistant"; 
import { DraftingConfigPanel } from "./drafting-config-panel";

// Libs
import { parseHtmlToEditorData, mergeHtmlFromEditorData } from "../lib/html-processor";

interface DraftingEditorProps {
  task: Task;
  isReadOnly?: boolean; 
}

type Step = "SELECT" | "EDITOR";
type EditorMode = "RICH_TEXT" | "RAW_HTML"; 

// --- HELPERS ---
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
  
  // State luồng & UI
  const [step, setStep] = useState<Step>(isReadOnly ? "EDITOR" : "SELECT");
  const [editorMode, setEditorMode] = useState<EditorMode>("RICH_TEXT"); 
  const [isAiOpen, setIsAiOpen] = useState(false); // Quản lý Drawer AI

  // State dữ liệu
  const [fullHtmlContent, setFullHtmlContent] = useState("");
  const [metadata, setMetadata] = useState<DraftMetadata>({});
  
  // State Async
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false); 

  // Parse HTML Memo
  const parsedData = useMemo(() => {
    return parseHtmlToEditorData(fullHtmlContent);
  }, [fullHtmlContent]);

  // --- 1. LOAD TEMPLATES ---
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

  // --- 2. LOAD DRAFT ---
  const handleLoadDraft = async () => {
    setIsLoadingDraft(true);
    try {
      const res = await draftingApi.loadDraft(task.id);
      if (typeof res === 'object' && res !== null) {
          if (!res.draftContent) {
             toast({ variant: "default", title: "Thông báo", description: "Chưa có bản nháp nào được lưu." });
             return;
          }
          setFullHtmlContent(res.draftContent);
          if (res.metadata) setMetadata(res.metadata);
      } else {
         toast({ description: "Dữ liệu bản nháp không hợp lệ." });
         return;
      }
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

  useEffect(() => {
    if (isReadOnly && step === "EDITOR") {
        handleLoadDraft();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadOnly, step]);

  // --- 3. SAVE DRAFT ---
  const executeSaveApi = async (contentToSave: string) => {
    if (isReadOnly) return;
    setIsSaving(true);
    try {
      const payload: SaveDraftPayload = {
        content: contentToSave,
        metadata: metadata 
      };

      await draftingApi.saveDraft(task.id, payload);
      setFullHtmlContent(contentToSave);
      toast({ title: "Thành công", description: "Văn bản và cấu hình đã được lưu.", className: "bg-[#009d98] text-white" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể lưu bản nháp." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRichTextSave = (newBody: string) => {
      const cssToUse = parsedData.originalCss || "";
      const mergedHtml = mergeHtmlFromEditorData(cssToUse, newBody);
      executeSaveApi(mergedHtml);
  };

  const handleRawHtmlSave = (newFullHtml: string) => {
      executeSaveApi(newFullHtml);
  };

  // --- HANDLERS ---
  const handleSelectTemplate = (tplContent: string) => {
    setFullHtmlContent(tplContent || "<p></p>");
    setStep("EDITOR");
    setEditorMode("RICH_TEXT"); 
  };

  const handleAiGenerated = (aiHtml: string) => {
    // Append AI content vào cuối văn bản
    const newBody = parsedData.bodyContent + "<br/>" + aiHtml;
    const merged = mergeHtmlFromEditorData(parsedData.originalCss, newBody);
    setFullHtmlContent(merged);
  };

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      const htmlString = wrapHtmlForWord(fullHtmlContent);
      const blob = await asBlob(htmlString, {
        orientation: 'portrait',
        margins: { top: 720, right: 720, bottom: 720, left: 720 },
      });
      const fileName = `${task.taskName || "Tai-lieu"}.docx`;
      saveAs(blob as Blob, fileName);
      toast({ title: "Thành công", description: "Đã tải xuống file Word." });
    } catch (error) {
      console.error("Export error:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể xuất file Word." });
    } finally {
      setIsExporting(false);
    }
  };

  // =========================================================
  // RENDER UI
  // =========================================================

  // [FIX START]: Bọc TemplateSelector trong div có padding để tránh bị Header đè
  if (step === "SELECT" && !isReadOnly) {
    return (
        <div className="w-full h-full p-6 overflow-y-auto bg-slate-50">
            <TemplateSelector 
                templates={templates} 
                isLoading={isLoadingTemplates} 
                onSelect={handleSelectTemplate}
                onLoadDraft={handleLoadDraft}
                isLoadingDraft={isLoadingDraft}
            />
        </div>
    );
  }
  // [FIX END]

  return (
    <div className="h-[calc(100vh-60px)] w-full flex flex-col bg-slate-100 overflow-hidden relative">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shrink-0 h-12 shadow-sm z-20">
            <div className="flex items-center gap-3">
               {!isReadOnly && (
                   <Button variant="ghost" size="sm" onClick={() => setStep("SELECT")} className="text-slate-500 hover:text-slate-800">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Mẫu khác
                   </Button>
               )}
               <div className="h-4 w-px bg-slate-200" />
               <span className="font-bold text-slate-700 text-sm truncate max-w-[300px]" title={task.taskName}>
                   {task.taskName}
               </span>
            </div>

            <div className="flex items-center gap-2">
               {/* Nút bật tắt Drawer AI */}
               {!isReadOnly && (
                 <Button 
                    size="sm" 
                    variant={isAiOpen ? "secondary" : "outline"}
                    onClick={() => setIsAiOpen(!isAiOpen)}
                    className={cn(
                      "text-purple-600 border-purple-200 hover:bg-purple-50 transition-colors", 
                      isAiOpen && "bg-purple-100 border-purple-300"
                    )}
                 >
                    <Sparkles className="w-4 h-4 mr-2" /> AI Trợ lý
                 </Button>
               )}

               {!isReadOnly && (
                   <>
                       <div className="h-4 w-px bg-slate-200 mx-1" />
                       <Button 
                         size="sm" 
                         onClick={() => executeSaveApi(fullHtmlContent)} 
                         disabled={isSaving}
                         className="bg-[#009d98] hover:bg-[#008580] text-white h-8 shadow-sm"
                       >
                          {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />} 
                          Lưu
                       </Button>
                       <Button 
                         variant="outline" size="sm" 
                         onClick={() => setEditorMode(m => m === "RICH_TEXT" ? "RAW_HTML" : "RICH_TEXT")}
                         className="text-xs h-8 border-slate-200 text-slate-600"
                       >
                          {editorMode === "RICH_TEXT" ? <Code className="w-3 h-3 mr-1"/> : <FileType className="w-3 h-3 mr-1"/>}
                          {editorMode === "RICH_TEXT" ? "Code" : "Visual"}
                       </Button>
                   </>
               )}
               
               <Button 
                  size="sm" variant="outline" 
                  onClick={handleExportDocx} 
                  disabled={isExporting}
                  className="h-8 text-slate-600 border-slate-200 hover:text-[#009d98] hover:border-[#009d98]"
               >
                  {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
               </Button>
            </div>
        </div>

        {/* MAIN LAYOUT: Config + Editor */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* CỘT 1: CONFIG (Truyền tên dự án xuống) */}
            {!isReadOnly && (
                <DraftingConfigPanel 
                    defaultValues={metadata}
                    onMetadataChange={setMetadata}
                    onAiGenerated={handleAiGenerated}
                    taskProjectName={task.projectName} // [QUAN TRỌNG] Truyền tên dự án từ Task
                />
            )}

            {/* CỘT 2: EDITOR */}
            <div className="flex-1 overflow-hidden relative flex flex-col min-w-0 bg-slate-100/50">
               {editorMode === "RICH_TEXT" ? (
                  <RichTextEditor 
                    initialContent={parsedData.bodyContent}
                    css={parsedData.editorCss}
                    onBack={() => {}} 
                    onSave={handleRichTextSave}
                    isSaving={isSaving}
                    isReadOnly={isReadOnly}
                  />
               ) : (
                  <RawHtmlEditor 
                    initialContent={fullHtmlContent}
                    onBack={() => {}} 
                    onSave={handleRawHtmlSave}
                    isSaving={isSaving}
                  />
               )}
            </div>

            {/* AI DRAWER (Trượt ra từ phải) */}
            <AiAssistant 
                  isOpen={isAiOpen} 
                  onClose={() => setIsAiOpen(false)}
                  currentHtml={fullHtmlContent}
                  onApplyChanges={(html) => setFullHtmlContent(html)}
                  mode="sidebar" // Đưa về dạng sidebar
            />
        </div>
    </div>
  );
};