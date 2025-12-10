// src/06_shared/ui/card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Button } from './button'; // Import thêm nút để demo cho đẹp

const meta: Meta<typeof Card> = {
  title: 'Shared/UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// Story này demo một cái thẻ hoàn chỉnh
export const ExampleCard: Story = {
  render: (args) => (
    <Card className="w-[350px]" {...args}>
      <CardHeader>
        <CardTitle>Dự án Alpha</CardTitle>
        <CardDescription>Quản lý đấu thầu xây dựng khu C.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Tiến độ hiện tại: 80%</p>
        <p>Ngân sách: 5 tỷ VNĐ</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost">Chi tiết</Button>
        <Button>Duyệt</Button>
      </CardFooter>
    </Card>
  ),
};