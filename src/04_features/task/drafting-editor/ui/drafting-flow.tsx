import { useEffect, useState, useMemo } from "react";
import { 
  FileCode, 
  FileType, 
  AlertCircle,
  Sparkles 
} from "lucide-react";

// Shared UI
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Alert, AlertDescription } from "@/shared/ui/alert";

// Entities
import { Template, templateApi } from "@/entities/template";

// Feature Components & Logic
import { TemplateSelector } from "./template-selector";
import { RichTextEditor } from "./rich-text-editor";
import { RawHtmlEditor } from "./raw-html-editor"; 
import { AiAssistant } from "./ai-assistant"; 
import { draftingApi } from "../api/drafting-api";

// Libs
import { parseHtmlToEditorData, mergeHtmlFromEditorData } from "../lib/html-processor";

interface DraftingFlowProps {
  taskId: number;
  taskName: string;
}

type Step = "SELECT" | "EDITOR";
type EditorMode = "RICH_TEXT" | "RAW_HTML";

export const DraftingFlow = ({ taskId, taskName }: DraftingFlowProps) => {
  const { toast } = useToast();

  // --- GLOBAL STATE ---
  const [step, setStep] = useState<Step>("SELECT");
  const [editorMode, setEditorMode] = useState<EditorMode>("RICH_TEXT");
  
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [fullHtmlContent, setFullHtmlContent] = useState("");
  
  // Data State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- 1. LOAD TEMPLATES ---
  useEffect(() => {
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
  }, [toast]);

  // --- 2. LOGIC TÁCH DỮ LIỆU ---
  const parsedData = useMemo(() => {
    return parseHtmlToEditorData(fullHtmlContent);
  }, [fullHtmlContent]);

  // --- HANDLERS ---
  
  const handleSelectTemplate = (content: string) => {
    setFullHtmlContent(content);
    setStep("EDITOR");
    setEditorMode("RICH_TEXT");
  };

  const handleLoadDraft = async () => {
    setIsLoadingDraft(true);
    try {
      const content = await draftingApi.loadDraft(taskId);
      if (!content) {
         toast({ variant: "default", title: "Thông báo", description: "Chưa có bản nháp nào được lưu." });
         return;
      }
      setFullHtmlContent(content);
      setStep("EDITOR");
      setEditorMode("RICH_TEXT");
      toast({ title: "Thành công", description: "Đã tải lại bản nháp.", className: "bg-[#009d98] text-white border-none" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải bản nháp." });
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const handleBackToSelect = () => {
    setStep("SELECT");
  };

  const executeSaveApi = async (contentToSave: string) => {
    setIsSaving(true);
    try {
      await draftingApi.saveDraft(taskId, contentToSave);
      setFullHtmlContent(contentToSave);
      toast({ title: "Đã lưu bản nháp", description: "Nội dung đã được đồng bộ lên hệ thống.", className: "bg-[#009d98] text-white border-none" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi lưu", description: "Không thể lưu bản nháp." });
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

  const toggleEditorMode = () => {
    if (editorMode === "RICH_TEXT") {
        setEditorMode("RAW_HTML");
    } else {
        setEditorMode("RICH_TEXT");
    }
  };

  const handleAiApplyChanges = (newHtml: string) => {
     setFullHtmlContent(newHtml);
     toast({ title: "AI Assistant", description: "Dữ liệu đã được điền tự động!", className: "bg-purple-600 text-white border-none" });
  };

  // --- RENDER ---
  
  if (step === "SELECT") {
    return (
      <TemplateSelector 
        templates={templates} 
        isLoading={isLoadingTemplates} 
        onSelect={handleSelectTemplate}
        onLoadDraft={handleLoadDraft}
        isLoadingDraft={isLoadingDraft}
      />
    );
  }

  return (
    <div className="space-y-0 h-full flex flex-col relative bg-white">
        
        {/* HEADER BAR (Nằm ngoài Editor để luôn hiển thị mode switcher) */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 py-3 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${editorMode === "RICH_TEXT" ? "bg-blue-100 text-blue-600" : "bg-slate-800 text-slate-300"}`}>
                    {editorMode === "RICH_TEXT" ? <FileType className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1 max-w-[300px]" title={taskName}>
                        {taskName}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        {editorMode === "RICH_TEXT" ? "Trình soạn thảo trực quan" : "Trình sửa mã nguồn HTML"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Warning Text */}
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                    <AlertCircle className="w-3 h-3" />
                    <span>Lưu trước khi đổi chế độ</span>
                </div>

                <Button 
                    size="sm" 
                    onClick={() => setIsAiOpen(true)} 
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm border border-purple-500 font-bold h-9"
                >
                    <Sparkles className="w-4 h-4" /> AI Trợ lý
                </Button>

                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleEditorMode}
                    className="gap-2 text-slate-600 hover:text-[#009d98] border-slate-200 h-9 font-medium"
                >
                    {editorMode === "RICH_TEXT" ? (
                        <><FileCode className="w-4 h-4" /> Switch to Code</>
                    ) : (
                        <><FileType className="w-4 h-4" /> Switch to Visual</>
                    )}
                </Button>
            </div>
        </div>

        {/* EDITOR AREA (Chiếm toàn bộ phần còn lại) */}
        <div className="flex-1 overflow-hidden relative">
            {editorMode === "RICH_TEXT" ? (
                <RichTextEditor 
                    initialContent={parsedData.bodyContent}
                    css={parsedData.editorCss} 
                    onBack={handleBackToSelect}
                    onSave={handleRichTextSave}
                    isSaving={isSaving}
                />
            ) : (
                <RawHtmlEditor 
                    initialContent={fullHtmlContent}
                    onBack={handleBackToSelect}
                    onSave={handleRawHtmlSave}
                    isSaving={isSaving}
                />
            )}
        </div>

        {/* AI ASSISTANT SIDEBAR */}
        <AiAssistant 
            isOpen={isAiOpen} 
            onClose={() => setIsAiOpen(false)}
            currentHtml={fullHtmlContent}
            onApplyChanges={handleAiApplyChanges}
        />
    </div>
  );
};