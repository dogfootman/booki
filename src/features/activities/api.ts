import { Activity, CreateActivityRequest, UpdateActivityRequest, ActivitiesResponse, ActivityResponse, ActivityQueryParams } from '@/types/activity';

const API_BASE = '/api/activities';

export const activitiesApi = {
  // Get all activities with optional filtering and pagination
  async getActivities(params?: ActivityQueryParams): Promise<ActivitiesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
    if (params?.min_price) searchParams.append('min_price', params.min_price.toString());
    if (params?.max_price) searchParams.append('max_price', params.max_price.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
    return response.json();
  },

  // Get a single activity by ID
  async getActivity(id: string): Promise<ActivityResponse> {
    const response = await fetch(`${API_BASE}/${id}`);
    return response.json();
  },

  // Create a new activity
  async createActivity(data: CreateActivityRequest): Promise<ActivityResponse> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Update an existing activity
  async updateActivity(id: string, data: UpdateActivityRequest): Promise<ActivityResponse> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete an activity
  async deleteActivity(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Get activity categories for filtering
  async getCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE}?limit=1000`);
    const data: ActivitiesResponse = await response.json();
    
    if (data.success && data.data) {
      const categories = data.data
        .map(activity => activity.category)
        .filter((category): category is string => !!category);
      
      return [...new Set(categories)]; // Remove duplicates
    }
    
    return [];
  },
};
