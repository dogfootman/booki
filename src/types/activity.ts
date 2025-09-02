import { z } from 'zod';
import type { TimeSlot } from './booking';

// Activity slot interface for time slots
export interface ActivitySlot {
  id?: string;
  start_time: string; // Format: "HH:mm" (e.g., "09:00")
  duration_minutes: number; // Duration in minutes
  end_time?: string; // Calculated end time (HH:mm)
  max_capacity: number; // Maximum participants for this slot
  is_available: boolean; // Whether this slot is available for booking
}

// Time slot interface for daily schedules (legacy - keeping for backward compatibility)
// Using TimeSlot from booking.ts to avoid conflicts

// Daily schedule time slot interface (different from booking TimeSlot)
export interface DailyScheduleTimeSlot {
  id?: string;
  start_time?: string; // Format: "HH:mm" (e.g., "09:00")
  end_time?: string;   // Format: "HH:mm" (e.g., "11:00")
  is_available?: boolean;
  max_capacity?: number;
  current_bookings?: number;
}

// Daily schedule interface
export interface DailySchedule {
  day_of_week?: number; // 0-6 (Sunday-Saturday)
  time_slots?: DailyScheduleTimeSlot[];
}

// Base activity interface
export interface Activity {
  id: string;
  title_en: string;
  title_ko?: string;
  description_en?: string;
  description_ko?: string;
  image_url?: string;
  price_usd: number;
  duration_minutes: number;
  max_participants: number;
  min_participants: number;
  location?: string;
  category?: string;
  tags: string[];
  daily_schedules: DailySchedule[]; // Available time slots for each day
  activity_slots: ActivitySlot[]; // New: specific time slots for the activity
  unavailable_dates: string[]; // Array of unavailable dates in YYYY-MM-DD format
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Create activity request interface
export interface CreateActivityRequest {
  title_en: string;
  title_ko?: string;
  description_en?: string;
  description_ko?: string;
  image_url?: string;
  price_usd: number;
  duration_minutes: number;
  max_participants: number;
  min_participants?: number;
  location?: string;
  category?: string;
  tags?: string[];
  daily_schedules?: DailySchedule[];
  activity_slots?: ActivitySlot[]; // New: specific time slots for the activity
  unavailable_dates?: string[]; // Array of unavailable dates in YYYY-MM-DD format
}

// Update activity request interface
export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  is_active?: boolean;
  daily_schedules?: DailySchedule[];
  activity_slots?: ActivitySlot[]; // New: specific time slots for the activity
  unavailable_dates?: string[]; // Array of unavailable dates in YYYY-MM-DD format
}

// Zod schemas for validation
// Activity slot schema
export const activitySlotSchema = z.object({
  id: z.string().uuid('Invalid slot ID').optional(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  duration_minutes: z.number().int().positive('Duration must be positive').max(1440, 'Duration cannot exceed 24 hours'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
  max_capacity: z.number().int().positive('Max capacity must be positive').max(1000, 'Max capacity too high'),
  is_available: z.boolean().default(true),
}).refine((data) => {
  // Validate that start_time + duration_minutes doesn't exceed 24 hours
  const [hours, minutes] = data.start_time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + data.duration_minutes;
  return totalMinutes <= 1440; // 24 hours = 1440 minutes
}, {
  message: 'Start time plus duration cannot exceed 24 hours',
  path: ['duration_minutes'],
});

// Time slot schema (legacy)
export const timeSlotSchema = z.object({
  id: z.string().uuid('Invalid time slot ID').optional(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
  is_available: z.boolean().optional(),
  max_capacity: z.number().int().positive('Max capacity must be positive').optional(),
  current_bookings: z.number().int().min(0, 'Current bookings cannot be negative').optional(),
});

// Daily schedule schema
export const dailyScheduleSchema = z.object({
  day_of_week: z.number().int().min(0).max(6, 'Day must be 0-6').optional(),
  time_slots: z.array(timeSlotSchema).optional(),
});

// Unavailable dates schema
export const unavailableDatesSchema = z.array(
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
).default([]);

export const createActivitySchema = z.object({
  title_en: z.string().min(1, 'English title is required').max(255, 'Title too long'),
  title_ko: z.string().max(255, 'Korean title too long').optional(),
  description_en: z.string().max(2000, 'English description too long').optional(),
  description_ko: z.string().max(2000, 'Korean description too long').optional(),
  image_url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  price_usd: z.number().positive('Price must be positive').max(999999.99, 'Price too high'),
  duration_minutes: z.number().int().positive('Duration must be positive').max(1440, 'Duration cannot exceed 24 hours'),
  max_participants: z.number().int().positive('Max participants must be positive').max(1000, 'Max participants too high'),
  min_participants: z.number().int().positive('Min participants must be positive').default(1),
  location: z.string().max(255, 'Location too long').optional(),
  category: z.string().max(100, 'Category too long').optional(),
  tags: z.array(z.string()).default([]),
  daily_schedules: z.array(dailyScheduleSchema).default([]),
  activity_slots: z.array(activitySlotSchema).default([]), // New: activity slots
  unavailable_dates: unavailableDatesSchema, // New: unavailable dates validation
}).refine((data) => {
  if (data.min_participants && data.max_participants) {
    return data.min_participants <= data.max_participants;
  }
  return true;
}, {
  message: 'Min participants cannot exceed max participants',
  path: ['min_participants'],
});

export const updateActivitySchema = z.object({
  title_en: z.string().min(1, 'English title is required').max(255, 'Title too long').optional(),
  title_ko: z.string().max(255, 'Korean title too long').optional(),
  description_en: z.string().max(2000, 'English description too long').optional(),
  description_ko: z.string().max(2000, 'Korean description too long').optional(),
  image_url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  price_usd: z.number().positive('Price must be positive').max(999999.99, 'Price too high').optional(),
  duration_minutes: z.number().int().positive('Duration must be positive').max(1440, 'Duration cannot exceed 24 hours').optional(),
  max_participants: z.number().int().positive('Max participants must be positive').max(1000, 'Max participants too high').optional(),
  min_participants: z.number().int().positive('Min participants must be positive').default(1).optional(),
  location: z.string().max(255, 'Location too long').optional(),
  category: z.string().max(100, 'Category too long').optional(),
  tags: z.array(z.string()).default([]).optional(),
  daily_schedules: z.array(dailyScheduleSchema).optional(),
  activity_slots: z.array(activitySlotSchema).optional(), // New: activity slots
  unavailable_dates: unavailableDatesSchema.optional(), // New: unavailable dates validation
  is_active: z.boolean().optional(),
});

export const activityIdSchema = z.object({
  id: z.string().uuid('Invalid activity ID'),
});

// Query parameters for listing activities
export interface ActivityQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
}

// Response types
export interface ActivityResponse {
  success: boolean;
  data?: Activity;
  error?: string;
}

export interface ActivitiesResponse {
  success: boolean;
  data?: Activity[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
