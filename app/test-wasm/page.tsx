// app/test-wasm/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function TestWasmPage() {
  const [result, setResult] = useState<number | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Import động (Dynamic Import) để tránh lỗi SSR
    const loadWasm = async () => {
      try {
        // Lưu ý: Đường dẫn này trỏ ra ngoài 'app' -> vào 'ai-bidding-wasm' -> 'pkg'
        // Bạn cần đảm bảo đã chạy 'wasm-pack build --target web' trước đó
        const wasm = await import("../../ai-bidding-wasm/pkg/ai_bidding_wasm.js");
        
        // Khởi tạo bộ nhớ Wasm
        await wasm.default();
        
        setIsLoaded(true);

        // Gọi thử hàm Rust (giả sử bạn đã viết hàm rust_add và rust_greet như hướng dẫn trước)
        // Nếu chưa có thì thay bằng hàm bạn đã viết
        if (wasm.rust_add) {
            setResult(wasm.rust_add(100, 50));
        }
        if (wasm.rust_greet) {
            setMsg(wasm.rust_greet("FSD Developer"));
        }

      } catch (err) {
        console.error("Lỗi tải Wasm:", err);
        setMsg("Lỗi: Không tải được module Wasm (Xem Console)");
      }
    };

    loadWasm();
  }, []);

  return (
    <div className="p-10 font-mono">
      <h1 className="text-2xl font-bold mb-4">🦀 Rust Wasm Test Lab</h1>
      
      <div className="border p-4 rounded bg-slate-100 space-y-2">
        <div>Status: {isLoaded ? "✅ Connected" : "⏳ Loading..."}</div>
        
        {isLoaded && (
            <>
                <div className="text-green-600 font-bold">
                  Phép cộng (Rust): 100 + 50 = {result}
                </div>
                <div className="text-blue-600">
                  Lời chào (Rust): {msg}
                </div>
            </>
        )}
      </div>
    </div>
  );
}