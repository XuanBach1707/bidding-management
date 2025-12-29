import React from 'react';
import { useEditor, EditorContent, Editor, Node, mergeAttributes, Mark } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// --- IMPORTS EXTENSIONS ---
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image'; // [MỚI] Import Image

// --- ICONS ---
import { 
  Bold, Italic, List, ListOrdered, 
  ArrowLeft, Save, Loader2, 
  Table as TableIcon, Plus, Trash2, Columns, Rows,
  ScissorsLineDashed, ImageIcon // [MỚI] Icon Ảnh
} from 'lucide-react';

// --- UI SHARED ---
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { Toggle } from '@/shared/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

// =========================================================
// CUSTOM EXTENSIONS (CỨU LAYOUT HTML)
// =========================================================

// 1. Dạy Tiptap hiểu thẻ <div> và giữ lại class, id, style
const DivExtension = Node.create({
  name: 'div',
  group: 'block',
  content: 'block+', 
  
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => ({ class: attributes.class }),
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => ({ style: attributes.style }),
      },
      id: {
        default: null,
        parseHTML: element => element.getAttribute('id'),
        renderHTML: attributes => ({ id: attributes.id }),
      },
    }
  },

  parseHTML() { return [{ tag: 'div' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes), 0] },
});

// 2. Dạy Tiptap hiểu thẻ <span> (cho placeholder)
const SpanExtension = Mark.create({
  name: 'span',
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => ({ class: attributes.class }),
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => ({ style: attributes.style }),
      },
    }
  },
  parseHTML() { return [{ tag: 'span' }] },
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(HTMLAttributes), 0] },
});

// =========================================================
// MAIN INTERFACE
// =========================================================

interface RichTextEditorProps {
  initialContent: string;
  css: string;
  onBack: () => void;
  onSave: (bodyContent: string) => void;
  isSaving?: boolean;
}

// =========================================================
// TOOLBAR COMPONENT
// =========================================================
const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  // Hàm thêm ảnh bằng URL
  const addImage = () => {
    const url = window.prompt('Nhập đường dẫn ảnh (URL):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border-b bg-slate-50 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-20">
      {/* --- TEXT FORMATTING --- */}
      <Toggle 
        size="sm" 
        pressed={editor.isActive('bold')} 
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      
      <Toggle 
        size="sm" 
        pressed={editor.isActive('italic')} 
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* --- LISTS --- */}
      <Toggle 
        size="sm" 
        pressed={editor.isActive('bulletList')} 
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      
      <Toggle 
        size="sm" 
        pressed={editor.isActive('orderedList')} 
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* --- TABLE TOOLS (INSERT) --- */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" size="sm" 
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
              <TableIcon className="h-4 w-4 text-blue-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Chèn bảng 3x3</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* --- TABLE TOOLS (MANIPULATION) --- */}
      {editor.isActive('table') && (
        <div className="flex bg-white border rounded ml-2 px-1 gap-1">
           {/* Cột */}
           <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Thêm cột">
             <Columns className="h-3 w-3" /><Plus className="h-2 w-2 mb-2 -ml-1" />
           </Button>
           <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => editor.chain().focus().deleteColumn().run()} title="Xóa cột">
              <Columns className="h-3 w-3 text-red-500" /><Trash2 className="h-2 w-2 mb-2 -ml-1 text-red-500" />
           </Button>
           
           <Separator orientation="vertical" className="h-4 mt-1.5" />
           
           {/* Dòng */}
           <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => editor.chain().focus().addRowAfter().run()} title="Thêm dòng">
              <Rows className="h-3 w-3" /><Plus className="h-2 w-2 -mt-2 -ml-1" />
           </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => editor.chain().focus().deleteRow().run()} title="Xóa dòng">
              <Rows className="h-3 w-3 text-red-500" /><Trash2 className="h-2 w-2 -mt-2 -ml-1 text-red-500" />
           </Button>
           
           <Separator orientation="vertical" className="h-4 mt-1.5" />
           
           {/* Xóa bảng */}
           <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => editor.chain().focus().deleteTable().run()} title="Xóa bảng">
              <Trash2 className="h-3 w-3" />
           </Button>
        </div>
      )}

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* --- [MỚI] IMAGE TOOL --- */}
      <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={addImage}>
                <ImageIcon className="h-4 w-4 text-green-600" />
            </Button>
            </TooltipTrigger>
            <TooltipContent>Chèn ảnh (URL)</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* --- PAGE BREAK --- */}
      <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
            <Button 
                variant="ghost" size="sm" 
                onClick={() => editor.chain().focus().insertContent('<div class="page-break"></div>').run()}
            >
                <ScissorsLineDashed className="h-4 w-4 text-orange-500" />
            </Button>
            </TooltipTrigger>
            <TooltipContent>Ngắt trang</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// =========================================================
// MAIN COMPONENT
// =========================================================
export const RichTextEditor = ({ 
  initialContent, 
  css, 
  onBack, 
  onSave, 
  isSaving 
}: RichTextEditorProps) => {
  
  const editor = useEditor({
    extensions: [
      // 1. Cấu hình StarterKit
      StarterKit.configure({
        paragraph: {
           HTMLAttributes: {
              class: 'class', // Hack: Cho phép pass class
           }
        },
        heading: {
           levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      
      // 2. Extensions hỗ trợ text/link
      TextStyle,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: null,
        }
      }),

      // 3. Cấu hình Table
      Table.configure({ 
        resizable: true,
        HTMLAttributes: {
            class: null,
            style: null,
        }
      }),
      TableRow,
      TableHeader,
      TableCell,

      // 4. Custom Extensions (Layout)
      DivExtension,  
      SpanExtension, 

      // 5. [MỚI] Image Extension
      Image.configure({
         inline: true,
         allowBase64: true, // Cho phép paste ảnh từ clipboard
         HTMLAttributes: {
            class: 'max-w-full h-auto my-4', 
         }
      }),
    ],
    content: initialContent,
    immediatelyRender: false, // Fix lỗi SSR Next.js
    
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[800px] p-[20mm] bg-white shadow-sm mx-auto my-4 border',
        style: 'width: 210mm;' 
      },
    },
  });

  const handleSave = () => {
    if (editor) {
      const bodyContent = editor.getHTML();
      onSave(bodyContent);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/50">
       <style>{css}</style>

       {/* Top Actions */}
       <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm sticky top-0 z-30">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-slate-600">
             <ArrowLeft className="w-4 h-4" /> Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 italic mr-2">
               Chế độ soạn thảo nâng cao
            </span>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-blue-600 gap-2 min-w-[100px]">
               {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               {isSaving ? "Đang lưu..." : "Lưu lại"}
            </Button>
          </div>
       </div>

       {/* Editor Container */}
       <div className="flex-1 overflow-y-auto relative">
          <div className="max-w-screen-lg mx-auto pb-20">
             <div className="sticky top-0 z-20 my-4 mx-auto w-[210mm] rounded-t-lg overflow-hidden border border-b-0 shadow-sm">
                <EditorToolbar editor={editor} />
             </div>
             
             <div className="editor-wrapper">
                <EditorContent editor={editor} />
             </div>
          </div>
       </div>
    </div>
  );
};