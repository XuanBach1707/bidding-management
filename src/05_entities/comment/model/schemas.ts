import { z } from "zod";

export const CreateCommentSchema = z.object({
  content: z.string().min(1, "Nội dung thảo luận không được để trống"),
  parentId: z.number().optional().nullable(), 
});

export type CreateCommentSchemaType = z.infer<typeof CreateCommentSchema>;