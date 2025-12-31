// Chỉ export những gì cần thiết cho bên ngoài sử dụng
export { DriveBrowser } from "./ui/drive-browser";

// Export hook nếu module khác cần tái sử dụng logic (Optional)
export { useDriveBrowser } from "./model/use-drive-browser";
export type { BreadcrumbItem } from "./model/use-drive-browser";