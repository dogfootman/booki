import { ActivityStaff, CreateActivityStaffRequest, UpdateActivityStaffRequest, ActivityStaffsResponse, ActivityStaffResponse } from '@/types/activity-staff';

const API_BASE = '/api/activity-staff';

export const activityStaffApi = {
  // Get all activity staff with optional filtering and pagination
  async getActivityStaffs(params?: {
    page?: number;
    limit?: number;
    is_active?: boolean | null;
    search?: string;
    agencyId?: string;
  }): Promise<ActivityStaffsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.is_active !== undefined && params?.is_active !== null) {
      searchParams.append('is_active', params.is_active.toString());
    }
    if (params?.search) searchParams.append('search', params.search);
    if (params?.agencyId) searchParams.append('agency_id', params.agencyId);

    const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
    return response.json();
  },

  // Get a single activity staff by ID
  async getActivityStaff(id: string): Promise<ActivityStaffResponse> {
    const response = await fetch(`${API_BASE}/${id}`);
    return response.json();
  },

  // Create a new activity staff
  async createActivityStaff(data: CreateActivityStaffRequest): Promise<ActivityStaffResponse> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Update an existing activity staff
  async updateActivityStaff(id: string, data: UpdateActivityStaffRequest): Promise<ActivityStaffResponse> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete an activity staff
  async deleteActivityStaff(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
