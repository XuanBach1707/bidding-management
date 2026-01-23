import { z } from 'zod';
import { 
    TaskTimelineActorSchema, 
    TaskTimelineEventSchema, 
    TaskTimelineListSchema 
} from './schema';

// Infer types từ Schema
export type TaskTimelineActor = z.infer<typeof TaskTimelineActorSchema>;
export type TaskTimelineEvent = z.infer<typeof TaskTimelineEventSchema>;
export type TaskTimelineList = z.infer<typeof TaskTimelineListSchema>;