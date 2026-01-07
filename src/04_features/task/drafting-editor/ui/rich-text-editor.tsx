import React, { useEffect } from 'react';
import { useEditor, EditorContent, Editor, Node, mergeAttributes, Mark } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// --- IMPORTS EXTENSIONS ---
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image'; 

// --- ICONS ---
import { 
  Bold, Italic, List, ListOrdered, 
  ArrowLeft, Save, Loader2, 
  Table as TableIcon, Plus, Trash2, Columns, Rows,
  ScissorsLineDashed, ImageIcon 
} from 'lucide-react';

// --- UI SHARED ---
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { Toggle } from '@/shared/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

// =========================================================
// CUSTOM EXTENSIONS
// =========================================================

const DivExtension = Node.create({
  name: 'div',
  group: 'block',
  content: 'block+', 
  addAttributes() {
    return {
      class: { default: null, parseHTML: el => el.getAttribute('class'), renderHTML: attrs => ({ class: attrs.class }) },
      style: { default: null, parseHTML: el => el.getAttribute('style'), renderHTML: attrs => ({ style: attrs.style }) },
      id: { default: null, parseHTML: el => el.getAttribute('id'), renderHTML: attrs => ({ id: attrs.id }) },
    }
  },
  parseHTML() { return [{ tag: 'div' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes), 0] },
});

const SpanExtension = Mark.create({
  name: 'span',
  addAttributes() {
    return {
      class: { default: null, parseHTML: el => el.getAttribute('class'), renderHTML: attrs => ({ class: attrs.class }) },
      style: { default: null, parseHTML: el => el.getAttribute('style'), renderHTML: attrs => ({ style: attrs.style }) },
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
  isReadOnly?: boolean; 
}

// =========================================================
// TOOLBAR COMPONENT
// =========================================================
const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Nhập đường dẫn ảnh (URL):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border-b bg-slate-50 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-20">
      <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* TABLE TOOLS */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
              <TableIcon className="h-4 w-4 text-blue-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Chèn bảng 3x3</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {editor.isActive('table') && (
        <div className="flex bg-white border rounded ml-2 px-1 gap-1">
           <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Thêm cột"><Columns className="h-3 w-3" /><Plus className="h-2 w-2 mb-2 -ml-1" /></Button>
           <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => editor.chain().focus().deleteColumn().run()} title="Xóa cột"><Columns className="h-3 w-3 text-red-500" /><Trash2 className="h-2 w-2 mb-2 -ml-1 text-red-500" /></Button>
           <Separator orientation="vertical" className="h-4 mt-1.5" />
           <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => editor.chain().focus().addRowAfter().run()} title="Thêm dòng"><Rows className="h-3 w-3" /><Plus className="h-2 w-2 -mt-2 -ml-1" /></Button>
           <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => editor.chain().focus().deleteRow().run()} title="Xóa dòng"><Rows className="h-3 w-3 text-red-500" /><Trash2 className="h-2 w-2 -mt-2 -ml-1 text-red-500" /></Button>
           <Separator orientation="vertical" className="h-4 mt-1.5" />
           <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => editor.chain().focus().deleteTable().run()} title="Xóa bảng"><Trash2 className="h-3 w-3" /></Button>
        </div>
      )}
      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button variant="ghost" size="sm" onClick={addImage}><ImageIcon className="h-4 w-4 text-green-600" /></Button>
      
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertContent('<div class="page-break"></div>').run()}><ScissorsLineDashed className="h-4 w-4 text-orange-500" /></Button>
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
  isSaving,
  isReadOnly = false 
}: RichTextEditorProps) => {
  
  const editor = useEditor({
    editable: !isReadOnly, 
    extensions: [
      StarterKit.configure({
        paragraph: { HTMLAttributes: { class: 'class' } },
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      TextStyle,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: null } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: null, style: null } }),
      TableRow, TableHeader, TableCell,
      DivExtension, SpanExtension, 
      Image.configure({ inline: true, allowBase64: true, HTMLAttributes: { class: 'max-w-full h-auto my-4' } }),
    ],
    content: initialContent, 
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[800px] p-[20mm] bg-white shadow-sm mx-auto my-4 border',
        style: 'width: 210mm;' 
      },
    },
  });

  // [FIX] Đồng bộ dữ liệu khi API trả về hoặc khi chuyển đổi template
  useEffect(() => {
    // Chỉ check editor tồn tại và initialContent không undefined (cho phép chuỗi rỗng)
    if (editor && typeof initialContent !== 'undefined') {
      const currentContent = editor.getHTML();
      // So sánh để tránh loop, nhưng phải đảm bảo set nếu đang là khởi tạo
      if (currentContent !== initialContent) {
         editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

  // Đồng bộ trạng thái ReadOnly
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly);
    }
  }, [editor, isReadOnly]);

  const handleSave = () => {
    if (editor) {
      const bodyContent = editor.getHTML();
      onSave(bodyContent);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/50">
       <style>{css}</style>

       {!isReadOnly && (
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
       )}

       <div className="flex-1 overflow-y-auto relative">
          <div className="max-w-screen-lg mx-auto pb-20">
             {!isReadOnly && (
                <div className="sticky top-0 z-20 my-4 mx-auto w-[210mm] rounded-t-lg overflow-hidden border border-b-0 shadow-sm">
                   <EditorToolbar editor={editor} />
                </div>
             )}
             <div className="editor-wrapper">
                <EditorContent editor={editor} />
             </div>
          </div>
       </div>
    </div>
  );
};