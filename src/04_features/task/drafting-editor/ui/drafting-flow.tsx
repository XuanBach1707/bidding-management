import { useEffect, useState, useMemo } from "react";
import { 
  FileCode, 
  FileType, 
  AlertCircle,
  Sparkles // [MỚI] Import icon cho nút AI
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
  
  // [MỚI] State điều khiển Sidebar AI
  const [isAiOpen, setIsAiOpen] = useState(false);

  // "Source of Truth"
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
      toast({ title: "Thành công", description: "Đã tải lại bản nháp." });
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
      toast({ title: "Đã lưu bản nháp", description: "Nội dung đã được đồng bộ." });
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

  // [MỚI] Hàm xử lý khi AI trả về nội dung mới
  const handleAiApplyChanges = (newHtml: string) => {
     setFullHtmlContent(newHtml);
     toast({ title: "AI Assistant", description: "Dữ liệu đã được điền tự động!" });
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
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300 relative">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm sticky top-0 z-20">
            <div>
                <h3 className="font-bold text-slate-800">Soạn thảo: {taskName}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                    {editorMode === "RICH_TEXT" ? "Chế độ văn bản (WYSIWYG)" : "Chế độ mã nguồn (HTML/Developer)"}
                </p>
            </div>

            <div className="flex items-center gap-2">
                {/* [MỚI] Nút AI nằm cạnh các nút chức năng khác */}
                <Button 
                    size="sm" 
                    onClick={() => setIsAiOpen(true)} // Mở Sidebar
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm border border-purple-500"
                >
                    <Sparkles className="w-4 h-4" /> AI Trợ lý
                </Button>

                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleEditorMode}
                    className="gap-2 text-slate-600 hover:text-blue-600 border-slate-200"
                >
                    {editorMode === "RICH_TEXT" ? (
                        <><FileCode className="w-4 h-4" /> Sửa HTML</>
                    ) : (
                        <><FileType className="w-4 h-4" /> Sửa Giao diện</>
                    )}
                </Button>
            </div>
        </div>

        {/* WARNING */}
        <Alert className="bg-blue-50 border-blue-100 py-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-700 ml-2">
                Lưu ý: Hãy bấm <strong>"Lưu lại"</strong> trước khi chuyển chế độ soạn thảo để tránh mất dữ liệu mới nhập.
            </AlertDescription>
        </Alert>

        {/* EDITOR */}
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

        {/* [MỚI] AI ASSISTANT - Đã truyền đủ props */}
        <AiAssistant 
            isOpen={isAiOpen} 
            onClose={() => setIsAiOpen(false)}
            currentHtml={fullHtmlContent}
            onApplyChanges={handleAiApplyChanges}
        />
    </div>
  );
};