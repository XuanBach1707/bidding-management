// src/06_shared/ui/input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Shared/UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Input nhập văn bản thường
export const Text: Story = {
  args: {
    type: 'text',
    placeholder: 'Nhập tên của bạn...',
  },
};

// Input mật khẩu (ẩn ký tự)
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Nhập mật khẩu...',
  },
};

// Input bị vô hiệu hóa
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Không thể nhập...',
  },
};

// Input chọn file
export const FileInput: Story = {
  args: {
    type: 'file',
  },
};