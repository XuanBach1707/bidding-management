import { z } from "zod";

// 1. Schema cho Actor (Người thực hiện)
// API gốc: user_id, full_name, avatar_url -> Client: userId, fullName, avatarUrl
export const TaskTimelineActorSchema = z.object({
  userId: z.number(),
  fullName: z.string(),
  avatarUrl: z.string(),
});

// 2. Schema cho từng sự kiện trong Timeline
// API gốc: old_status, new_status, created_at -> Client: oldStatus, newStatus, createdAt
export const TaskTimelineEventSchema = z.object({
  id: z.number(),
  action: z.string(), // Có thể dùng z.enum([...]) nếu danh sách action cố định
  oldStatus: z.string().nullable(),
  newStatus: z.string().nullable(),
  detail: z.string(),
  createdAt: z.string(), // Dạng ISO string
  actor: TaskTimelineActorSchema,
});

// 3. Schema cho danh sách (Response trả về array)
export const TaskTimelineListSchema = z.array(TaskTimelineEventSchema);

// 4. Infer Types từ Schema để dùng trong code
export type TaskTimelineActor = z.infer<typeof TaskTimelineActorSchema>;
export type TaskTimelineEvent = z.infer<typeof TaskTimelineEventSchema>;
export type TaskTimelineList = z.infer<typeof TaskTimelineListSchema>;