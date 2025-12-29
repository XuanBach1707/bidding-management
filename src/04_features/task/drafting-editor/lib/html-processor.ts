export const parseHtmlToEditorData = (fullHtml: string) => {
  if (!fullHtml) return { originalCss: "", editorCss: "", bodyContent: "" };

  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, "text/html");

  // 1. Lấy toàn bộ CSS
  const rawCss = Array.from(doc.querySelectorAll("style"))
    .map((style) => style.innerHTML)
    .join("\n");

  let originalCss = rawCss;
  let editorCss = rawCss;

  // 2. Logic thông minh: Kiểm tra xem CSS đầu vào đang ở dạng nào?
  // Ta kiểm tra xem có class đặc thù của Tiptap không
  const hasProseMirror = rawCss.includes(".ProseMirror");

  if (hasProseMirror) {
     // --- TRƯỜNG HỢP A: Load từ DRAFT (Đã có .ProseMirror) ---
     // Editor: Dùng luôn
     editorCss = rawCss;
     
     // Original: Phải Revert (Đảo ngược) về body để lưu và preview
     originalCss = rawCss
        // Lưu ý: Thứ tự replace quan trọng. Phải replace Wrapper trước.
        .replace(/\.ProseMirror-wrapper/g, "html") 
        .replace(/\.ProseMirror/g, "body");
  } else {
     // --- TRƯỜNG HỢP B: Load từ TEMPLATE (Đang là body) ---
     // Original: Giữ nguyên
     originalCss = rawCss;

     // Editor: Phải Scope (Đổi tên) body thành class .ProseMirror
     // Cải tiến Regex: Bắt chính xác từ khóa "body" khi nó là selector
     editorCss = rawCss
        .replace(/(^|[\s,}])body([{\s,>])/g, "$1.ProseMirror$2") // Regex mạnh mẽ hơn: body {, body >, body, html
        .replace(/(^|[\s,}])html([{\s,>])/g, "$1.ProseMirror-wrapper$2");
  }

  // 3. Thêm style Visual cho Page Break (Chỉ hiện trong Editor)
  editorCss += `
    .page-break {
      page-break-after: always;
      border-top: 2px dashed #ccc;
      margin: 20px 0;
      position: relative;
      display: block;
    }
    .page-break::after {
      content: 'Ngắt trang';
      position: absolute;
      right: 0; top: -12px;
      font-size: 10px; color: #888; background: #eee; padding: 2px 8px;
      border-radius: 4px;
    }
    /* Ẩn placeholder khi in/preview */
    @media print {
      .page-break { border-top: none; margin: 0; }
      .page-break::after { display: none; }
    }
  `;

  const bodyContent = doc.body.innerHTML;

  return {
    originalCss,
    editorCss,
    bodyContent,
  };
};

export const mergeHtmlFromEditorData = (originalCss: string, bodyContent: string) => {
  // [QUAN TRỌNG] body ở đây KHÔNG được có class="ProseMirror"
  // Vì originalCss của ta đã target vào thẻ "body" rồi.
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Văn bản đấu thầu</title>
    <style>
${originalCss}
    </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
};