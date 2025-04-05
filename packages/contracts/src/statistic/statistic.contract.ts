
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { HttpStatus } from '../common/http-status';
import { LearningStreakSchema, RecentActivitySchema, TodayGoalSchema, WeeklyOverviewSchema, WordsDueTodaySchema, WordsLearnedSchema } from './statistic.schemas';
import { UnauthorizedResponse } from 'src/common/responses';

const c = initContract();

export const statisticContract = c.router({
  getWordsLearned: {
    method: 'GET',
    path: '/stats/words-learned',
    summary: 'Get the total words learned and increase this week',
    responses: {
      [HttpStatus.OK]: WordsLearnedSchema,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },
  getWordsDueToday: {
    method: 'GET',
    path: '/stats/words-due-today',
    summary: 'Get words due for today, including new and reviews',
    responses: {
      [HttpStatus.OK]: WordsDueTodaySchema,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },
  getLearningStreak: {
    method: 'GET',
    path: '/stats/learning-streak',
    summary: 'Get the current learning streak in days',
    responses: {
      [HttpStatus.OK]: LearningStreakSchema,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },
  getTodayGoal: {
    method: 'GET',
    path: '/stats/today-goal',
    summary: 'Get the daily learning goal status',
    responses: {
      [HttpStatus.OK]: TodayGoalSchema,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },
  getWeeklyOverview: {
    method: 'GET',
    path: '/stats/weekly-overview',
    summary: 'Get weekly overview of daily progress and total words learned',
    responses: {
      [HttpStatus.OK]: WeeklyOverviewSchema,
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },
  getRecentActivity: {
    method: 'GET',
    path: '/stats/recent-activity',
    summary: 'Get recent learning activities',
    responses: {
      [HttpStatus.OK]: z.array(RecentActivitySchema),
      [HttpStatus.UNAUTHORIZED]: UnauthorizedResponse,
    },
  },
});
