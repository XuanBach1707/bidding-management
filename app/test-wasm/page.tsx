// app/test-wasm/page.tsx
"use client";

import { useEffect, useState } from "react";

// Định nghĩa Interface dữ liệu trả về từ Rust
interface RustEditorData {
  original_css: string;
  editor_css: string;
  body_content: string;
}

export default function TestWasmPage() {
  // --- STATE ---
  const [wasm, setWasm] = useState<any>(null);
  const [status, setStatus] = useState<string>("⏳ Đang tải Wasm...");
  
  // 1. State cho Image Test
  const [imgOriginal, setImgOriginal] = useState<string | null>(null);
  const [imgCompressed, setImgCompressed] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ original: 0, compressed: 0 });

  // 2. State cho Docx Export Test (HTML SAMPLE VỚI BẢNG)
  const [docxText, setDocxText] = useState(`
<h1>HỒ SƠ DỰ THẦU</h1>
<p>Kính gửi: Ban quản lý dự án.</p>
<table>
  <tbody>
    <tr>
      <td><strong>STT</strong></td>
      <td><strong>Hạng mục</strong></td>
      <td><strong>Thành tiền</strong></td>
    </tr>
    <tr>
      <td>1</td>
      <td>Xây dựng phần mềm</td>
      <td>150.000.000</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Module AI Rust</td>
      <td>50.000.000</td>
    </tr>
  </tbody>
</table>
<p>Trân trọng.</p>
`);

  // 3. [MỚI] State cho Import Docx Test
  const [importedHtml, setImportedHtml] = useState<string>("");

  // 4. State cho Sanitizer Test
  const [dirtyInput, setDirtyInput] = useState(`<div><script>alert('Hack!');</script><p onclick="stealCookie()">Nội dung an toàn</p></div>`);
  const [cleanOutput, setCleanOutput] = useState("");

  // --- INIT WASM ---
  useEffect(() => {
    const loadWasm = async () => {
      try {
        const wasmModule = await import("../../ai-bidding-wasm/pkg/ai_bidding_wasm.js");
        await wasmModule.default(); // Init memory
        
        if (wasmModule.init_panic_hook) {
            wasmModule.init_panic_hook();
        }

        setWasm(wasmModule);
        setStatus("✅ Rust Enterprise Ready");
      } catch (err) {
        console.error(err);
        setStatus("❌ Lỗi tải Wasm");
      }
    };
    loadWasm();
  }, []);

  // --- ACTIONS ---

  // 1. Test Nén Ảnh
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !wasm) return;

    setImgOriginal(URL.createObjectURL(file));
    setImgSize(prev => ({ ...prev, original: file.size }));

    const buffer = await file.arrayBuffer();
    const u8Array = new Uint8Array(buffer);

    try {
      const start = performance.now();
      const compressedBytes = wasm.compress_image(u8Array);
      const end = performance.now();
      
      console.log(`Nén ảnh: ${(end - start).toFixed(2)}ms`);

      const blob = new Blob([compressedBytes], { type: "image/png" });
      setImgCompressed(URL.createObjectURL(blob));
      setImgSize(prev => ({ ...prev, compressed: blob.size }));
    } catch (err) {
      alert("Lỗi nén ảnh: " + err);
    }
  };

  // 2. Test Xuất Docx (Export)
  const handleExportDocx = () => {
    if (!wasm) return;
    try {
       const bytes = wasm.export_to_docx(docxText);
       const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
       const url = URL.createObjectURL(blob);
       const a = document.createElement("a");
       a.href = url;
       a.download = "rust_export.docx";
       a.click();
       URL.revokeObjectURL(url);
    } catch (err) {
        alert("Lỗi xuất file: " + err);
    }
  };

  // 3. [MỚI] Test Nhập Docx (Import)
  const handleImportDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !wasm) return;

    const buffer = await file.arrayBuffer();
    const u8Array = new Uint8Array(buffer);

    try {
        const start = performance.now();
        // GỌI RUST: Đọc Docx -> HTML
        const html = wasm.read_docx_to_html(u8Array);
        const end = performance.now();
        
        console.log(`Đọc Docx: ${(end - start).toFixed(2)}ms`);
        setImportedHtml(html);
    } catch (err) {
        alert("Lỗi đọc file Docx: " + err);
    }
  };

  // 4. Test Sanitizer
  const handleSanitize = () => {
      if (!wasm) return;
      try {
          const clean = wasm.sanitize_html_paste(dirtyInput);
          setCleanOutput(clean);
      } catch (err) {
          console.error(err);
      }
  };

  return (
    <div className="p-8 font-mono max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-bold text-[#009d98]">🦀 Rust Enterprise Lab</h1>
        <span className="bg-slate-100 px-3 py-1 rounded text-sm font-bold">{status}</span>
      </div>

      {/* --- SECTION 1: IMAGE COMPRESSOR --- */}
      <section className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📸 1. Image Compressor</h2>
        <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#009d98] file:text-white hover:file:bg-[#007d7a]"
        />
        <div className="grid grid-cols-2 gap-8">
            <div>
                <p className="text-xs font-bold text-slate-500 mb-2">ORIGINAL ({Math.round(imgSize.original / 1024)} KB)</p>
                {imgOriginal && <img src={imgOriginal} className="w-full h-48 object-contain border bg-slate-50" />}
            </div>
            <div>
                <p className="text-xs font-bold text-[#009d98] mb-2">
                    COMPRESSED ({Math.round(imgSize.compressed / 1024)} KB) 
                    {imgSize.original > 0 && <span className="ml-2 text-green-600">(-{Math.round((1 - imgSize.compressed/imgSize.original)*100)}%)</span>}
                </p>
                {imgCompressed && <img src={imgCompressed} className="w-full h-48 object-contain border bg-slate-50" />}
            </div>
        </div>
      </section>

      {/* --- SECTION 2: DOCX EXPORTER --- */}
      <section className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📤 2. Docx Export (HTML to Word)</h2>
        <p className="text-sm text-slate-500 mb-2">HTML đầu vào (có bảng):</p>
        <textarea 
            value={docxText}
            onChange={(e) => setDocxText(e.target.value)}
            className="w-full border p-3 rounded h-32 text-sm font-mono bg-slate-50 mb-4"
        />
        <button 
            onClick={handleExportDocx}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold text-sm"
        >
            ⬇️ Download .docx
        </button>
      </section>

      {/* --- SECTION 3: DOCX IMPORTER (NEW) --- */}
      <section className="border rounded-lg p-6 bg-white shadow-sm border-purple-200">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-700">📥 3. Docx Import (Word to HTML)</h2>
        <p className="text-sm text-slate-500 mb-2">Chọn file .docx có bảng để Rust đọc thành HTML:</p>
        
        <input 
            type="file" 
            accept=".docx" 
            onChange={handleImportDocx}
            className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
        />

        {importedHtml && (
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">RAW HTML (Rust Output)</p>
                    <textarea 
                        readOnly
                        value={importedHtml}
                        className="w-full h-64 text-xs border p-2 bg-slate-50 font-mono resize-none"
                    />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">PREVIEW (Browser Render)</p>
                    <div 
                        className="w-full h-64 border p-4 overflow-auto prose prose-sm max-w-none bg-white"
                        dangerouslySetInnerHTML={{ __html: importedHtml }}
                    />
                </div>
            </div>
        )}
      </section>

      {/* --- SECTION 4: HTML SANITIZER --- */}
      <section className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🛡️ 4. Security Sanitizer</h2>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-xs font-bold text-red-500 mb-2">DIRTY INPUT</p>
                <textarea 
                    value={dirtyInput}
                    onChange={(e) => setDirtyInput(e.target.value)}
                    className="w-full border border-red-200 bg-red-50 p-2 rounded h-32 text-xs"
                />
            </div>
            <div>
                <p className="text-xs font-bold text-green-500 mb-2">CLEAN OUTPUT</p>
                <textarea 
                    readOnly
                    value={cleanOutput}
                    className="w-full border border-green-200 bg-green-50 p-2 rounded h-32 text-xs"
                />
            </div>
        </div>
        <button 
            onClick={handleSanitize}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 font-bold text-sm"
        >
            🧹 Run Clean
        </button>
      </section>
    </div>
  );
}