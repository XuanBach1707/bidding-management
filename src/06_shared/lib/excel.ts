import * as XLSX from "xlsx";

export const excelUtils = {
  /**
   * Đọc file Excel và trả về dữ liệu JSON
   * @param file File object từ input[type="file"]
   * @returns Promise<any[]>
   */
  readExcel: (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          // Đọc file dạng binary
          const workbook = XLSX.read(data, { type: "binary" });
          
          // Lấy sheet đầu tiên
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          
          // Chuyển sheet thành JSON
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  },

  /**
   * Xuất dữ liệu JSON ra file Excel
   * @param data Mảng dữ liệu cần xuất
   * @param fileName Tên file muốn lưu (không cần đuôi .xlsx)
   */
  exportExcel: (data: any[], fileName: string) => {
    // Tạo workbook mới
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    
    // Thêm sheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  },
};