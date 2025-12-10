import { format, parseISO, isValid } from "date-fns";
import { vi } from "date-fns/locale"; // Import ngôn ngữ tiếng Việt

// Format ngày chuẩn VN: 20/12/2025
export const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return "--/--/----";
  
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  
  if (!isValid(date)) return "Ngày lỗi";
  
  return format(date, "dd/MM/yyyy");
};

// Format ngày giờ chi tiết: 20/12/2025 14:30
export const formatDateTime = (dateString: string | Date | undefined): string => {
  if (!dateString) return "--/--/---- --:--";
  
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  
  if (!isValid(date)) return "Thời gian lỗi";

  return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
};