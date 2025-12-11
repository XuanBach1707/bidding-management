import type { Meta, StoryObj } from '@storybook/react';
import { DynamicDetailView } from './DynamicDetailView';
import { SectionGroup } from '../types/dynamic-view'; // Đảm bảo import đúng đường dẫn type

const meta: Meta<typeof DynamicDetailView> = {
  title: 'Features/DynamicDetailView',
  component: DynamicDetailView,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DynamicDetailView>;

// Dữ liệu giả mô phỏng ảnh bạn gửi (Đã có key đầy đủ)
const SCREENSHOT_DATA: SectionGroup[] = [
  {
    id: 's1',
    title: 'Thông tin cơ bản',
    fields: [
      { key: 'code', label: 'Mã TBMT', value: 'TBMT-2025-00128' },
      { key: 'date', label: 'Ngày đăng tải', value: '09/12/2025 11:29' },
      { key: 'version', label: 'Phiên bản thay đổi', value: '00' },
    ]
  },
  {
    id: 's2',
    title: 'Thông tin chung của KHLCNT',
    fields: [
      { key: 'khlcnt', label: 'Mã KHLCNT', value: 'PL2500332749', fullWidth: true },
      { key: 'type', label: 'Phân loại KHLCNT', value: 'Chi thường xuyên' },
      { key: 'budget', label: 'Tên dự toán mua sắm', value: 'VSP- Lô 09-1' },
    ]
  },
  {
    id: 's3',
    title: 'Thông tin gói thầu',
    fields: [
      { key: 'process', label: 'Quy trình áp dụng', value: 'Khác (bao gồm ADB/WB...)', fullWidth: true },
      { key: 'name', label: 'Tên gói thầu', value: 'Xây dựng trường tiểu học Bình Minh - Giai đoạn 2', fullWidth: true },
      { key: 'investor', label: 'Chủ đầu tư', value: 'Ban QLDA ĐTXD Quận Cầu Giấy', fullWidth: true },
    ]
  }
];

// Story 1: Render giống ảnh mẫu
export const DefaultScreenshot: Story = {
  args: {
    sections: SCREENSHOT_DATA
  }
};

// Story 2: Test logic động (Nhiều khối hơn)
export const ManySections: Story = {
  args: {
    sections: [
      ...SCREENSHOT_DATA,
      {
        id: 's4',
        title: 'Thông tin thầu phụ (Dynamic Added)',
        fields: [
            // Đã thêm 'key' vào các dòng dưới đây để fix lỗi
            { key: 'main_contr', label: 'Nhà thầu chính', value: 'Công ty ABC' },
            { key: 'rate', label: 'Tỉ lệ', value: '10%' }
        ]
      },
       {
        id: 's5',
        title: 'Thông tin bảo lãnh (Dynamic Added)',
        fields: [
            // Đã thêm 'key' vào dòng dưới đây để fix lỗi
            { key: 'bank_name', label: 'Ngân hàng', value: 'Vietcombank', fullWidth: true }
        ]
      }
    ]
  }
};

// Story 3: Test trạng thái Loading
export const LoadingState: Story = {
  args: {
    isLoading: true,
    sections: [], // Khi loading thì không cần dữ liệu
  }
};