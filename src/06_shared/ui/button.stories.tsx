import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button'; // Import component ngay bên cạnh

// 1. Cấu hình Meta: Định nghĩa component này là gì, nằm ở đâu trong menu
const meta: Meta<typeof Button> = {
  title: 'Shared/UI/Button', // Đường dẫn hiển thị trong Sidebar của Storybook
  component: Button,
  tags: ['autodocs'], // Tự động tạo trang tài liệu (Docs)
  // Cấu hình các nút điều khiển (Controls) để bạn chỉnh sửa trực tiếp trên giao diện
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Kiểu hiển thị của nút',
    },
    size: {
      control: 'radio',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Kích thước nút',
    },
    disabled: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' }, // Ghi lại sự kiện click ở tab Actions
  },
  parameters: {
    layout: 'centered', // Căn giữa nút cho dễ nhìn
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// 2. Các Stories (Các trường hợp sử dụng cụ thể)

// Nút mặc định (Primary)
export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Button Mặc Định',
    asChild: false
  },
};

// Nút hành động nguy hiểm (Xóa/Hủy)
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Xóa dữ liệu',
  },
};

// Nút chỉ có viền (Outline)
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Xem chi tiết',
  },
};

// Nút Ghost (thường dùng trong dropdown hoặc toolbar)
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

// Demo nút kích thước lớn
export const LargeSize: Story = {
  args: {
    variant: 'default',
    size: 'lg',
    children: 'Đăng Ký Ngay',
  },
};

// Demo trạng thái đang loading (kết hợp Disabled)
export const Loading: Story = {
  args: {
    disabled: true,
    children: 'Đang xử lý...',
  },
};