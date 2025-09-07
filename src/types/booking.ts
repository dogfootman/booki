import { z } from 'zod';

// Base booking interface
export interface Booking {
  id: string;
  activity_id: string;
  activity_staff_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  participants: number;
  start_time: string; // ISO string
  end_time: string; // ISO string
  total_price_usd: number;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Booking status enum
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

// Create booking request interface
export interface CreateBookingRequest {
  activity_id: string;
  activity_staff_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  participants: number;
  start_time: string;
  end_time: string;
  total_price_usd: number;
  notes?: string;
}

// Update booking request interface
export interface UpdateBookingRequest extends Partial<CreateBookingRequest> {
  status?: BookingStatus;
}

// Activity staff schedule interface
export interface ActivityStaffSchedule {
  id: string;
  activity_staff_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  is_available: boolean;
  max_bookings_per_day?: number;
  created_at: string;
  updated_at: string;
}

// Activity staff availability interface for specific dates
export interface ActivityStaffAvailability {
  activity_staff_id: string;
  date: string; // YYYY-MM-DD format
  available_slots: TimeSlot[];
  total_bookings: number;
  max_bookings: number;
}

// Time slot interface
export interface TimeSlot {
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  is_available: boolean;
  current_bookings: number;
  max_bookings: number;
}

// Calendar view types
export type CalendarView = 'day' | 'week' | 'month';

// Calendar event interface
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'unavailable' | 'break';
  activity_staff_id?: string;
  booking_id?: string;
  color?: string;
}

// Zod schemas for validation
export const createBookingSchema = z.object({
  activity_id: z.string().min(1, 'Activity is required'),
  activity_staff_id: z.string().optional(),
  customer_name: z.string().min(1, 'Customer name is required').max(255, 'Name too long'),
  customer_email: z.string().email('Invalid email format'),
  customer_phone: z.string().optional(),
  participants: z.number().int().positive('Participants must be positive').max(1000, 'Too many participants'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  total_price_usd: z.number().positive('Price must be positive').max(999999.99, 'Price too high'),
  notes: z.string().max(1000, 'Notes too long').optional(),
}).refine((data) => {
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  return start < end;
}, {
  message: 'Start time must be before end time',
  path: ['end_time'],
});

export const updateBookingSchema = z.object({
  activity_id: z.string().uuid('Invalid activity ID').optional(),
  activity_staff_id: z.string().uuid('Invalid activity staff ID').optional(),
  customer_name: z.string().min(1, 'Customer name is required').max(255, 'Name too long').optional(),
  customer_email: z.string().email('Invalid email format').optional(),
  customer_phone: z.string().optional(),
  participants: z.number().int().positive('Participants must be positive').max(1000, 'Too many participants').optional(),
  start_time: z.string().datetime('Invalid start time format').optional(),
  end_time: z.string().datetime('Invalid end time format').optional(),
  total_price_usd: z.number().positive('Price must be positive').max(999999.99, 'Price too high').optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

export const activityStaffScheduleSchema = z.object({
  activity_staff_id: z.string().uuid('Invalid activity staff ID'),
  day_of_week: z.number().int().min(0).max(6, 'Day must be 0-6'),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  is_available: z.boolean(),
  max_bookings_per_day: z.number().int().positive('Max bookings must be positive').optional(),
}).refine((data) => {
  const start = data.start_time;
  const end = data.end_time;
  return start < end;
}, {
  message: 'Start time must be before end time',
  path: ['end_time'],
});

// Query parameters for listing bookings
export interface BookingQueryParams {
  page?: number;
  limit?: number;
  activity_staff_id?: string;
  activity_id?: string;
  status?: BookingStatus;
  start_date?: string;
  end_date?: string;
  customer_email?: string;
}

// Response types
export interface BookingResponse {
  success: boolean;
  data?: Booking;
  error?: string;
}

export interface BookingsResponse {
  success: boolean;
  data?: Booking[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ActivityStaffScheduleResponse {
  success: boolean;
  data?: ActivityStaffSchedule;
  error?: string;
}

export interface ActivityStaffSchedulesResponse {
  success: boolean;
  data?: ActivityStaffSchedule[];
  error?: string;
}

export interface ActivityStaffAvailabilityResponse {
  success: boolean;
  data?: ActivityStaffAvailability;
  error?: string;
}
