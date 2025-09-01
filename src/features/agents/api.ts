import { Agent, CreateAgentRequest, UpdateAgentRequest, AgentsResponse, AgentResponse } from '@/types/agent';

const API_BASE = '/api/agents';

export const agentsApi = {
  // Get all agents with optional filtering and pagination
  async getAgents(params?: {
    page?: number;
    limit?: number;
    is_active?: boolean | null;
    search?: string;
  }): Promise<AgentsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.is_active !== undefined && params?.is_active !== null) {
      searchParams.append('is_active', params.is_active.toString());
    }
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
    return response.json();
  },

  // Get a single agent by ID
  async getAgent(id: string): Promise<AgentResponse> {
    const response = await fetch(`${API_BASE}/${id}`);
    return response.json();
  },

  // Create a new agent
  async createAgent(data: CreateAgentRequest): Promise<AgentResponse> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Update an existing agent
  async updateAgent(id: string, data: UpdateAgentRequest): Promise<AgentResponse> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete an agent
  async deleteAgent(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
