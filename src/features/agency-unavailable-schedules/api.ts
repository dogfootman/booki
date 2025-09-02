import { 
  AgencyUnavailableSchedule,
  CreateAgencyUnavailableScheduleRequest,
  UpdateAgencyUnavailableScheduleRequest,
  AgencyUnavailableScheduleResponse,
  AgencyUnavailableSchedulesResponse,
  AgencyUnavailableScheduleFilters
} from '@/types';

const API_BASE = '/api/agency-unavailable-schedules';

export const agencyUnavailableSchedulesApi = {
  // Get all agency unavailable schedules with optional filtering and pagination
  async getSchedules(params?: AgencyUnavailableScheduleFilters & {
    page?: number;
    limit?: number;
  }): Promise<AgencyUnavailableSchedulesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.agency_id) searchParams.append('agency_id', params.agency_id);
    if (params?.date) searchParams.append('date', params.date);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.is_active !== undefined && params.is_active !== null) {
      searchParams.append('is_active', params.is_active.toString());
    }
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
    return response.json();
  },

  // Get a single agency unavailable schedule by ID
  async getSchedule(id: string): Promise<AgencyUnavailableScheduleResponse> {
    const response = await fetch(`${API_BASE}/${id}`);
    return response.json();
  },

  // Create a new agency unavailable schedule
  async createSchedule(data: CreateAgencyUnavailableScheduleRequest): Promise<AgencyUnavailableScheduleResponse> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Update an existing agency unavailable schedule
  async updateSchedule(id: string, data: UpdateAgencyUnavailableScheduleRequest): Promise<AgencyUnavailableScheduleResponse> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete an agency unavailable schedule
  async deleteSchedule(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Convenience methods for specific use cases

  // Get unavailable schedules for a specific agency
  async getSchedulesByAgency(agencyId: string, params?: {
    date_from?: string;
    date_to?: string;
    is_active?: boolean;
  }): Promise<AgencyUnavailableSchedulesResponse> {
    return this.getSchedules({
      agency_id: agencyId,
      ...params,
    });
  },

  // Check if a specific date is unavailable for an agency
  async isDateUnavailable(agencyId: string, date: string): Promise<boolean> {
    try {
      const response = await this.getSchedules({
        agency_id: agencyId,
        date: date,
        is_active: true,
      });
      
      if (!response.success || !response.data) return false;
      
      return response.data.length > 0;
    } catch (error) {
      console.error('Error checking date availability:', error);
      return false;
    }
  },

  // Get unavailable dates for an agency within a date range
  async getUnavailableDatesInRange(
    agencyId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<string[]> {
    try {
      const response = await this.getSchedules({
        agency_id: agencyId,
        date_from: dateFrom,
        date_to: dateTo,
        is_active: true,
      });
      
      if (!response.success || !response.data) return [];
      
      return response.data
        .map(schedule => schedule.date)
        .sort();
    } catch (error) {
      console.error('Error getting unavailable dates:', error);
      return [];
    }
  },

  // Bulk create schedules for multiple dates
  async createBulkSchedules(
    agencyId: string,
    dates: string[],
    reason?: string
  ): Promise<{ success: AgencyUnavailableSchedule[]; errors: string[] }> {
    const success: AgencyUnavailableSchedule[] = [];
    const errors: string[] = [];

    for (const date of dates) {
      try {
        const response = await this.createSchedule({
          agency_id: agencyId,
          date,
          reason,
        });

        if (response.success && response.data) {
          success.push(response.data);
        } else {
          errors.push(`${date}: ${response.error || 'Unknown error'}`);
        }
      } catch (error) {
        errors.push(`${date}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success, errors };
  },

  // Toggle schedule active status
  async toggleScheduleStatus(
    id: string,
    isActive: boolean
  ): Promise<AgencyUnavailableScheduleResponse> {
    return this.updateSchedule(id, { is_active: isActive });
  },
};
