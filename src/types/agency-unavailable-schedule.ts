/**
 * Agency Unavailable Schedule Types
 * 에이전시 불가 스케줄 타입 정의
 */

export interface AgencyUnavailableSchedule {
  id: string;
  agency_id: string;
  date: string; // YYYY-MM-DD format
  reason?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAgencyUnavailableScheduleRequest {
  agency_id: string;
  date: string; // YYYY-MM-DD format
  reason?: string;
}

export interface UpdateAgencyUnavailableScheduleRequest {
  date?: string; // YYYY-MM-DD format
  reason?: string;
  is_active?: boolean;
}

export interface AgencyUnavailableScheduleResponse {
  success: boolean;
  data?: AgencyUnavailableSchedule;
  error?: string;
}

export interface AgencyUnavailableSchedulesResponse {
  success: boolean;
  data?: AgencyUnavailableSchedule[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query filters for unavailable schedules
export interface AgencyUnavailableScheduleFilters {
  agency_id?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  is_active?: boolean;
  search?: string;
}
