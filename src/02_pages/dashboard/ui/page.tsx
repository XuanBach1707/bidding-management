// File: 02_pages/project-dashboard/index.tsx
import React from 'react';

/**
 * Trang Dashboard Nghiệp vụ tối giản
 * Dùng để kiểm tra định tuyến và hiển thị Sidebar/Global Layout
 */
export const DashboardPage: React.FC = () => {
  return (
    // Khu vực nội dung trang
    <div className="project-dashboard-page" style={{ padding: '24px' }}>
      <h1>Dashboard Nghiệp vụ (Sẵn sàng cho Nội dung)</h1>
      {/* Nội dung thực tế (Widgets/Features) sẽ được thêm vào đây sau */}
    </div>
  );
};