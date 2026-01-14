use wasm_bindgen::prelude::*;

// Hàm này sẽ được xuất sang JS
#[wasm_bindgen]
pub fn rust_add(a: i32, b: i32) -> i32 {
    return a + b;
}

// Hàm test thử trả về string chào hỏi
#[wasm_bindgen]
pub fn rust_greet(name: &str) -> String {
    format!("Xin chào {}, lời chào từ Rust Wasm!", name)
}