import type { Meta, StoryObj } from '@storybook/react';
import { ProjectList } from './ProjectList';
import { ProjectCardData } from '../types/dashboard';

const meta: Meta<typeof ProjectList> = {
  title: 'Features/ProjectList',
  component: ProjectList,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ProjectList>;

// MOCK DATA: Giống hệt trong ảnh bạn gửi
const DASHBOARD_DATA: ProjectCardData[] = [
  {
    id: '1',
    code: 'TBMT-2025-00128',
    aiStatus: 'ready', // Chấm xanh
    title: 'Xây dựng trường tiểu học Bình Minh - Giai đoạn 2',
    investor: 'Ban QLDA ĐTXD Quận Cầu Giấy',
    footerType: 'progress', // Loại thanh tiến độ
    progress: { daysLeft: 10, percent: 45 }
  },
  {
    id: '2',
    code: 'TBMT-2025-00199',
    aiStatus: 'limited', // Chấm cam
    title: 'Cung cấp thiết bị CNTT cho Sở GDĐT Hà Nội',
    investor: 'Sở Giáo dục Đào tạo Hà Nội',
    footerType: 'action', // Loại nút bấm
    action: { label: 'Đã duyệt - Chờ khởi tạo' }
  },
  {
    id: '3',
    code: 'TBMT-2025-00205',
    aiStatus: 'none', // Chấm xám
    title: 'Thi công đường vành đai 4 - Gói thầu XL-09',
    investor: 'Bộ Giao thông Vận tải',
    footerType: 'progress',
    progress: { daysLeft: 15, percent: 70 }
  }
];

export const DashboardExample: Story = {
  args: {
    projects: DASHBOARD_DATA,
  },
};

// Story cho trạng thái đang tải
export const LoadingState: Story = {
  args: {
    isLoading: true,
    projects: [], // Không cần data thật
  },
};