import type { Meta, StoryObj } from '@storybook/react';
import { PlanEditor } from './PlanEditor';
import { PlanNode, EditorAssignee } from '../types/ai-plan-editor';

const meta: Meta<typeof PlanEditor> = {
  title: 'Features/PlanEditor (Complex Tree)', // Đặt tên nhóm rõ ràng
  component: PlanEditor,
  parameters: {
    layout: 'padded', // Để có khoảng trống xung quanh dễ nhìn
  },
};

export default meta;
type Story = StoryObj<typeof PlanEditor>;

// --- 1. DỮ LIỆU GIẢ LẬP NHÂN SỰ ---
const MOCK_USERS: EditorAssignee[] = [
  { id: 'u1', name: 'Nguyễn Văn A', initials: 'NA' },
  { id: 'u2', name: 'Trần Thị B', initials: 'TB' },
  { id: 'u3', name: 'Lê Văn C', initials: 'LC' },
];

// --- 2. DỮ LIỆU CÂY CÔNG VIỆC (Lồng nhau) ---
const INITIAL_TREE_DATA: PlanNode[] = [
  {
    id: 'root-1',
    code: '1.',
    name: 'Hồ sơ Pháp lý (Cấp 1)',
    assigneeId: 'u1',
    deadline: '20/12/2025',
    confidence: 100,
    children: [
      {
        id: 'child-1-1',
        code: '1.1',
        name: 'Soạn đơn dự thầu (Cấp 2)',
        assigneeId: 'u1',
        deadline: '18/12/2025',
        confidence: 99,
        children: [] // Không có con
      },
      {
        id: 'child-1-2',
        code: '1.2',
        name: 'Chuẩn bị bảo lãnh (Cấp 2)',
        assigneeId: 'u2',
        deadline: '19/12/2025',
        confidence: 95,
        children: [
            {
                id: 'grandchild-1-2-1',
                code: '1.2.1',
                name: 'Liên hệ ngân hàng (Cấp 3 - Test thụt lề)',
                assigneeId: 'u3',
                deadline: '18/12/2025',
                confidence: 90,
                children: []
            }
        ]
      }
    ]
  },
  {
    id: 'root-2',
    code: '2.',
    name: 'Giải pháp Kỹ thuật (Cấp 1)',
    assigneeId: null, // Chưa gán người
    deadline: '25/12/2025',
    confidence: 80,
    children: []
  }
];

// --- 3. CÁC STORIES ---

// Case chuẩn: Có dữ liệu sẵn
export const DefaultEditor: Story = {
  args: {
    users: MOCK_USERS,
    initialData: INITIAL_TREE_DATA,
  },
};

// Case rỗng: Để test tính năng "Thêm mới từ đầu" (Nếu bạn có nút thêm root)
// Lưu ý: Trong code PlanEditor hiện tại tôi chưa làm nút "Thêm Root", 
// bạn có thể thêm nút đó ở ngoài component row nếu cần.
export const EmptyState: Story = {
  args: {
    users: MOCK_USERS,
    initialData: [], 
  },
};

// Case Deep Nesting: Test xem thụt lề nhiều cấp có bị vỡ layout không
export const DeepNestingStressTest: Story = {
  args: {
    users: MOCK_USERS,
    initialData: [
        {
            id: 'l1', code: '1', name: 'Level 1', assigneeId: 'u1', deadline: '', confidence: 100,
            children: [{
                id: 'l2', code: '1.1', name: 'Level 2', assigneeId: 'u1', deadline: '', confidence: 100,
                children: [{
                    id: 'l3', code: '1.1.1', name: 'Level 3', assigneeId: 'u1', deadline: '', confidence: 100,
                    children: [{
                        id: 'l4', code: '1.1.1.1', name: 'Level 4 (Sâu quá xem có lỗi không)', assigneeId: 'u1', deadline: '', confidence: 100,
                        children: []
                    }]
                }]
            }]
        }
    ],
  },
};