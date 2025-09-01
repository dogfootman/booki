import { z } from 'zod';

// Base agent interface
export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  languages: string[];
  specialties: string[];
  hourly_rate?: number;
  max_hours_per_day: number;
  is_active: boolean;
  agency_id: string; // 소속 에이전시 ID 추가
  created_at: string;
  updated_at: string;
}

// Create agent request interface
export interface CreateAgentRequest {
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  languages?: string[];
  specialties?: string[];
  hourly_rate?: number;
  max_hours_per_day?: number;
  agency_id: string; // 소속 에이전시 ID 추가
}

// Update agent request interface
export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  is_active?: boolean;
}

// Zod schemas for validation
export const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  avatar_url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  bio: z.string().max(1000, 'Bio too long').optional(),
  languages: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  hourly_rate: z.number().positive('Hourly rate must be positive').optional(),
  max_hours_per_day: z.number().int().min(1).max(24).default(8),
  agency_id: z.string().min(1, 'Agency is required'), // 소속 에이전시 필수 필드
});

export const updateAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  bio: z.string().max(1000, 'Bio too long').optional(),
  languages: z.array(z.string()).default([]).optional(),
  specialties: z.array(z.string()).default([]).optional(),
  hourly_rate: z.number().positive('Hourly rate must be positive').optional(),
  max_hours_per_day: z.number().int().min(1).max(24).default(8).optional(),
  is_active: z.boolean().optional(),
  agency_id: z.string().min(1, 'Agency is required').optional(), // 소속 에이전시 선택적 필드
});

export const agentIdSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
});

// Response types
export interface AgentResponse {
  success: boolean;
  data?: Agent;
  error?: string;
}

export interface AgentsResponse {
  success: boolean;
  data?: Agent[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
