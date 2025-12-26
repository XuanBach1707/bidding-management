import { z } from "zod";

export const CreateCommentSchema = z.object({
  content: z.string().min(1, "Nội dung thảo luận không được để trống"),
  parent_id: z.number().optional().nullable(), // Nullable để tương thích nếu BE trả về null
});

export type CreateCommentSchemaType = z.infer<typeof CreateCommentSchema>;