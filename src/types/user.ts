import { z } from 'zod';

// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  AGENCY_MANAGER = 'agency_manager',
  AGENT = 'agent',
}

// Base user interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  agency_id?: string; // For agency_manager and agent roles
  created_at: string;
  updated_at: string;
}

// User with role-specific data
export interface AdminUser extends User {
  role: UserRole.ADMIN;
  permissions: string[];
}

export interface AgencyManagerUser extends User {
  role: UserRole.AGENCY_MANAGER;
  agency_id: string;
  agency_name: string;
  permissions: string[];
}

export interface AgentUser extends User {
  role: UserRole.AGENT;
  agency_id: string;
  agency_name: string;
  specialties: string[];
  languages: string[];
}

// Union type for all user types
export type AuthenticatedUser = AdminUser | AgencyManagerUser | AgentUser;

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
}

// Auth state interface
export interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Zod schemas for validation
export const loginSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const userRoleSchema = z.nativeEnum(UserRole);
