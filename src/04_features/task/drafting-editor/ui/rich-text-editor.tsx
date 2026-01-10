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
  ScissorsLineDashed, ImageIcon, Check
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
    <div className="border-b border-slate-200 bg-slate-50/80 backdrop-blur px-2 py-1.5 flex flex-wrap gap-1 items-center sticky top-0 z-20 shadow-sm">
      <div className="flex bg-white border border-slate-200 rounded-md p-0.5">
          <Toggle size="sm" className="h-8 w-8 data-[state=on]:bg-[#009d98]/10 data-[state=on]:text-[#009d98]" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle size="sm" className="h-8 w-8 data-[state=on]:bg-[#009d98]/10 data-[state=on]:text-[#009d98]" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </Toggle>
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1 bg-slate-300" />
      
      <div className="flex bg-white border border-slate-200 rounded-md p-0.5">
          <Toggle size="sm" className="h-8 w-8" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle size="sm" className="h-8 w-8" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-4 w-4" />
          </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1 bg-slate-300" />

      {/* TABLE TOOLS */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 px-2 hover:bg-blue-50 hover:text-blue-600" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
              <TableIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Chèn bảng 3x3</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {editor.isActive('table') && (
        <div className="flex bg-white border border-slate-200 rounded-md ml-2 px-1 gap-0.5 shadow-sm">
           <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-blue-600" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Thêm cột"><Columns className="h-3 w-3" /><Plus className="h-2 w-2 mb-2 -ml-1" /></Button>
           <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-600" onClick={() => editor.chain().focus().deleteColumn().run()} title="Xóa cột"><Columns className="h-3 w-3 text-slate-400 group-hover:text-red-600" /><Trash2 className="h-2 w-2 mb-2 -ml-1" /></Button>
           <Separator orientation="vertical" className="h-4 mt-2 mx-1" />
           <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-blue-600" onClick={() => editor.chain().focus().addRowAfter().run()} title="Thêm dòng"><Rows className="h-3 w-3" /><Plus className="h-2 w-2 -mt-2 -ml-1" /></Button>
           <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-600" onClick={() => editor.chain().focus().deleteRow().run()} title="Xóa dòng"><Rows className="h-3 w-3 text-slate-400 group-hover:text-red-600" /><Trash2 className="h-2 w-2 -mt-2 -ml-1" /></Button>
           <Separator orientation="vertical" className="h-4 mt-2 mx-1" />
           <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => editor.chain().focus().deleteTable().run()} title="Xóa bảng"><Trash2 className="h-4 w-4" /></Button>
        </div>
      )}
      <Separator orientation="vertical" className="h-6 mx-1 bg-slate-300" />

      <Button variant="ghost" size="sm" className="h-9 px-2 hover:text-green-600 hover:bg-green-50" onClick={addImage}><ImageIcon className="h-4 w-4" /></Button>
      
      <Button variant="ghost" size="sm" className="h-9 px-2 hover:text-orange-600 hover:bg-orange-50" onClick={() => editor.chain().focus().insertContent('<div class="page-break"></div>').run()}><ScissorsLineDashed className="h-4 w-4" /></Button>
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
        // [QUAN TRỌNG] Style khổ giấy A4
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[297mm] p-[20mm] bg-white shadow-lg mx-auto my-8 border border-slate-200 print:shadow-none print:border-0',
        style: 'width: 210mm;' 
      },
    },
  });

  useEffect(() => {
    if (editor && typeof initialContent !== 'undefined') {
      const currentContent = editor.getHTML();
      if (currentContent !== initialContent) {
         editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

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
    <div className="flex flex-col h-full bg-slate-100">
       <style>{css}</style>

       {!isReadOnly && (
           <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
              <Button variant="outline" size="sm" onClick={onBack} className="gap-2 text-slate-600 border-slate-200 hover:text-[#009d98] hover:border-[#009d98]">
                 <ArrowLeft className="w-4 h-4" /> Quay lại
              </Button>
              
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:inline-block">
                   Soạn thảo trực tuyến (A4)
                </span>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-[#009d98] hover:bg-[#008580] text-white font-bold shadow-sm gap-2 min-w-[120px]">
                   {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   {isSaving ? "Đang lưu..." : "Lưu văn bản"}
                </Button>
              </div>
           </div>
       )}

       <div className="flex-1 overflow-y-auto relative bg-slate-100/50">
          <div className="max-w-[230mm] mx-auto pb-20">
             
             {/* Toolbar nằm ngay trên tờ giấy */}
             {!isReadOnly && (
                <div className="sticky top-4 z-20 my-4 mx-auto w-[210mm] rounded-t-lg overflow-hidden border border-slate-200 border-b-0 shadow-sm">
                   <EditorToolbar editor={editor} />
                </div>
             )}
             
             {/* Paper Container */}
             <div className="editor-wrapper transition-all duration-300">
                <EditorContent editor={editor} />
             </div>
             
             {!isReadOnly && (
                <p className="text-center text-xs text-slate-400 mt-4">
                   Hết trang 1
                </p>
             )}
          </div>
       </div>
    </div>
  );
};