// ==========================================
// SCHEMAS - Validation Zod (DTOs entrants)
// ==========================================
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const healthGoalSchema = z.object({
  weight: z.number().positive().max(400),
  targetWeight: z.number().positive().max(400),
  height: z.number().positive().min(50).max(250),
  activityLevel: z.enum(['low', 'medium', 'high']).optional(),
});

export const aiAdviceSchema = z.object({
  message: z.string().min(1).max(1000),
});

export const photoAnalyzeSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  imageBase64: z.string().optional(),
}).refine((data) => data.description || data.imageBase64, {
  message: 'description ou imageBase64 requis',
});

export const nutritionLogSchema = z.object({
  source: z.enum(['barcode', 'photo', 'manual', 'recipe']),
  label: z.string().min(1).max(200),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']).optional(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
  fiber: z.number().nonnegative().optional(),
  waterMl: z.number().nonnegative().optional(),
});

export const weightLogSchema = z.object({
  weight: z.number().positive().max(400),
});

export const fridgeItemSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.number().positive().optional(),
  unit: z.string().max(20).optional(),
  expiresAt: z.string().optional(),
});

export const preferencesSchema = z.object({
  budget: z.number().positive().max(1000).optional(),
  goal: z.enum(['healthy', 'fast', 'budget', 'muscle']).optional(),
  dietary: z.array(z.string()).optional(),
  servings: z.number().positive().max(20).optional(),
  locale: z.enum(['fr', 'en']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notificationsEnabled: z.boolean().optional(),
});
