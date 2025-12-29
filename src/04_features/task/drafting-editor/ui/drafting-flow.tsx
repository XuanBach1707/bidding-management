import { useEffect, useState, useMemo } from "react";
import { 
  ArrowRightLeft, 
  FileCode, 
  FileType, 
  AlertCircle 
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
import { RawHtmlEditor } from "./raw-html-editor"; // Giả sử bạn đã tách file này
import { draftingApi } from "../api/drafting-api";

// [QUAN TRỌNG] Import hàm merge để xử lý dữ liệu khi lưu
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
  
  // "Source of Truth" - Chứa toàn bộ HTML (bao gồm cả HEAD, STYLE, BODY)
  const [fullHtmlContent, setFullHtmlContent] = useState("");
  
  // Data State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false); // [FIX] Thêm state này
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

  // --- 2. LOGIC CHUYỂN ĐỔI DỮ LIỆU ---
  // Tách HTML thành { originalCss, editorCss, bodyContent }
  const parsedData = useMemo(() => {
    return parseHtmlToEditorData(fullHtmlContent);
  }, [fullHtmlContent]);

  // --- HANDLERS ---
  
  // Chọn Template (Tạo mới)
  const handleSelectTemplate = (content: string) => {
    setFullHtmlContent(content);
    setStep("EDITOR");
    setEditorMode("RICH_TEXT");
  };

  // [FIX] Load Draft (Tiếp tục bản cũ)
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

  // Quay lại màn hình chọn
  const handleBackToSelect = () => {
    setStep("SELECT");
  };

  // Lưu bản nháp (API) - Hàm cấp thấp, nhận vào Full HTML
  const executeSaveApi = async (contentToSave: string) => {
    setIsSaving(true);
    try {
      await draftingApi.saveDraft(taskId, contentToSave);
      setFullHtmlContent(contentToSave); // Update Source of Truth
      toast({ title: "Đã lưu bản nháp", description: "Nội dung đã được đồng bộ." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi lưu", description: "Không thể lưu bản nháp." });
    } finally {
      setIsSaving(false);
    }
  };

  // [QUAN TRỌNG] Xử lý khi Rich Text bấm Lưu
  // Vì RichText chỉ trả về Body, ta phải trộn với Original CSS
  const handleRichTextSave = (newBody: string) => {
      const cssToUse = parsedData.originalCss || "";
      const mergedHtml = mergeHtmlFromEditorData(cssToUse, newBody);
      executeSaveApi(mergedHtml);
  };

  // Xử lý khi Raw HTML bấm Lưu
  // Raw HTML trả về Full HTML luôn, nên lưu thẳng
  const handleRawHtmlSave = (newFullHtml: string) => {
      executeSaveApi(newFullHtml);
  };

  // Chuyển chế độ Editor
  const toggleEditorMode = () => {
    if (editorMode === "RICH_TEXT") {
        setEditorMode("RAW_HTML");
    } else {
        setEditorMode("RICH_TEXT");
    }
  };

  // --- RENDER ---
  
  // 1. MÀN HÌNH CHỌN MẪU
  if (step === "SELECT") {
    return (
      <TemplateSelector 
        templates={templates} 
        isLoading={isLoadingTemplates} 
        onSelect={handleSelectTemplate}
        // [FIX] Truyền thêm props cho tính năng Load Draft
        onLoadDraft={handleLoadDraft}
        isLoadingDraft={isLoadingDraft}
      />
    );
  }

  // 2. MÀN HÌNH SOẠN THẢO
  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
        {/* HEADER ĐIỀU HƯỚNG & CHUYỂN MODE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
            <div>
                <h3 className="font-bold text-slate-800">Soạn thảo: {taskName}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                    {editorMode === "RICH_TEXT" ? "Chế độ văn bản (WYSIWYG)" : "Chế độ mã nguồn (HTML/Developer)"}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleEditorMode}
                    className="gap-2 text-slate-600 hover:text-blue-600 border-slate-200"
                    title="Chuyển đổi giữa giao diện Word và Code HTML"
                >
                    {editorMode === "RICH_TEXT" ? (
                        <><FileCode className="w-4 h-4" /> Sửa HTML</>
                    ) : (
                        <><FileType className="w-4 h-4" /> Sửa Giao diện</>
                    )}
                </Button>
            </div>
        </div>

        {/* CẢNH BÁO KHI CHUYỂN MODE */}
        <Alert className="bg-blue-50 border-blue-100 py-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-700 ml-2">
                Lưu ý: Hãy bấm <strong>"Lưu lại"</strong> trước khi chuyển chế độ soạn thảo để tránh mất dữ liệu mới nhập.
            </AlertDescription>
        </Alert>

        {/* KHUNG EDITOR CHÍNH */}
        {editorMode === "RICH_TEXT" ? (
            <RichTextEditor 
                initialContent={parsedData.bodyContent} // Chỉ truyền Body
                
                // [FIX] Sửa 'css' thành 'parsedData.editorCss' để khớp type
                css={parsedData.editorCss}                   
                
                onBack={handleBackToSelect}
                
                // [FIX] Dùng hàm handleRichTextSave để trộn dữ liệu
                onSave={handleRichTextSave}               
                
                isSaving={isSaving}
            />
        ) : (
            // Component này bạn giữ nguyên logic cũ hoặc cập nhật theo DraftingEditor.tsx nếu cần
            <RawHtmlEditor 
                initialContent={fullHtmlContent}       // Truyền Full HTML
                onBack={handleBackToSelect}
                onSave={handleRawHtmlSave}             // Hàm save thẳng
                isSaving={isSaving}
            />
        )}
    </div>
  );
};