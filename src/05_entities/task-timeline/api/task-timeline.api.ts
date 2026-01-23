import { http } from '@/shared/api'; // Bạn chỉnh lại đường dẫn import http cho đúng với source của bạn
import { TaskTimelineList } from '../model/types';

export const getTaskHistory = async (taskId: number | string): Promise<TaskTimelineList> => {
    // Gọi API: GET /tasks/{task_id}/history
    // http instance đã tự động xử lý camelCase cho response data
    return await http.get<any, TaskTimelineList>(`/tasks/${taskId}/history`);
};