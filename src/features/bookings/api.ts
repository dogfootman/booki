import { Booking, CreateBookingRequest, UpdateBookingRequest, BookingsResponse, BookingResponse } from '@/types/booking';

const API_BASE = '/api/bookings';

export const bookingsApi = {
  // Get all bookings with optional filtering
  async getBookings(params?: {
    search?: string;
    status?: string;
    agent_id?: string;
    activity_id?: string;
  }): Promise<BookingsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.agent_id) searchParams.append('agent_id', params.agent_id);
    if (params?.activity_id) searchParams.append('activity_id', params.activity_id);

    const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
    return response.json();
  },

  // Get a single booking by ID
  async getBooking(id: string): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE}/${id}`);
    return response.json();
  },

  // Create a new booking
  async createBooking(data: CreateBookingRequest): Promise<BookingResponse> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Update an existing booking
  async updateBooking(id: string, data: UpdateBookingRequest): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete a booking
  async deleteBooking(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
