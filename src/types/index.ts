// Export all types for easy importing
export * from './agent';
export * from './activity';
export * from './booking';
export * from './user';

// 에이전시 타입 정의
export interface Agency {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAgencyRequest {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
}

export interface UpdateAgencyRequest extends Partial<CreateAgencyRequest> {
  is_active?: boolean;
}

export interface AgencyResponse {
  success: boolean;
  data?: Agency;
  error?: string;
}

export interface AgenciesResponse {
  success: boolean;
  data?: Agency[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
