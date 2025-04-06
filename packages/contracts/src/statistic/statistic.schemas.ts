import { z } from "zod";

export const WordsLearnedSchema = z.object({
  total: z.number(),
  increaseThisWeek: z.number(),
});

export const WordsDueTodaySchema = z.object({
  total: z.number(),
  new: z.number(),
  reviews: z.number(),
});

export const LearningStreakSchema = z.object({
  days: z.number(),
});

export const TodayGoalSchema = z.object({
  completed: z.number(),
  target: z.number(),
  progressPercent: z.number(),
  estimatedTimeMinutes: z.number(),
});

export const WeeklyOverviewSchema = z.object({
  totalWords: z.number(),
  dailyProgress: z.array(
    z.object({
      day: z.string().length(1), // M, T, W, T, F, S, S
      percent: z.number().min(0).max(100),
    }),
  ),
});

export const RecentActivitySchema = z.object({
  time: z.string(),
  action: z.string(),
  count: z.number(),
});
