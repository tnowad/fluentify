import { z } from "zod";

export const TopicSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const CreateTopicRequest = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const UpdateTopicRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});
