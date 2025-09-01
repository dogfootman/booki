import { Agency, CreateAgencyRequest, UpdateAgencyRequest, AgenciesResponse, AgencyResponse } from '@/types';

const API_BASE = '/api/agencies';

export const agenciesApi = {
  // Get all agencies with optional filtering and pagination
  async getAgencies(params?: {
    page?: number;
    limit?: number;
    is_active?: boolean;
    search?: string;
  }): Promise<AgenciesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
    return response.json();
  },

  // Get a single agency by ID
  async getAgency(id: string): Promise<AgencyResponse> {
    const response = await fetch(`${API_BASE}/${id}`);
    return response.json();
  },

  // Create a new agency
  async createAgency(data: CreateAgencyRequest): Promise<AgencyResponse> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Update an existing agency
  async updateAgency(id: string, data: UpdateAgencyRequest): Promise<AgencyResponse> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete an agency
  async deleteAgency(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
