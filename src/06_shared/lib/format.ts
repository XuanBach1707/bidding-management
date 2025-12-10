// Sử dụng API chuẩn của trình duyệt, không cần cài thư viện nặng
export const formatVND = (amount: number | string | undefined | null): string => {
  if (!amount) return "0 ₫";
  
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0, // Tiền Việt thường không dùng số lẻ
  }).format(value);
};

// Hàm format phần trăm (VD: Tiến độ 0.5 -> 50%)
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
};