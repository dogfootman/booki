'use client';

import React, { useState, useEffect, useMemo } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar as CalendarIcon, Users, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Calendar } from '@/components/calendar';
import { BookingForm } from '@/components/booking/BookingForm';
import { BookingDetailSheet } from '@/components/booking/BookingDetailSheet';
import { agentsApi } from '@/features/agents/api';
import { activitiesApi } from '@/features/activities/api';
import { bookingsApi } from '@/features/bookings/api';
import { CalendarEvent, CreateBookingRequest, BookingStatus } from '@/types/booking';
import { Agent, Activity } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function CalendarPage() {
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isBookingDetailSheetOpen, setIsBookingDetailSheetOpen] = useState(false);
  const { toast } = useToast();
  // const queryClient = useQueryClient();

  // TODO: Uncomment when Supabase is connected
  // const { data: agentsData } = useQuery({
  //   queryKey: ['agents'],
  //   queryFn: () => agentsApi.getAgents(),
  // });

  // const { data: activitiesData } = useQuery({
  //   queryKey: ['activities'],
  //   queryFn: () => activitiesApi.getActivities(),
  // });

  // const { data: bookingsData } = useQuery({
  //   queryKey: ['bookings'],
  //   queryFn: () => bookingsApi.getBookings(),
  // });

  // Mock data for now since Supabase is not connected
  const agentsData = { 
    data: [
      { id: '1', name: 'John Doe', email: 'john@example.com', is_active: true },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', is_active: true }
    ] 
  };
  
  // Use actual API for activities to get daily_schedules
  const [activitiesData, setActivitiesData] = useState<any>({ data: [] });
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities');
        const data = await response.json();
        setActivitiesData(data);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        // Fallback to mock data if API fails
        setActivitiesData({ 
          data: [
            { id: '1', title_en: 'Surfing Lesson', price_usd: 80, duration_minutes: 120 },
            { id: '2', title_en: 'Hiking Tour', price_usd: 60, duration_minutes: 180 }
          ] 
        });
      }
    };
    
    fetchActivities();
  }, []);
  
  // Use actual API for bookings to get real data
  const [bookingsData, setBookingsData] = useState<any>({ data: [] });
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        const data = await response.json();
        setBookingsData(data);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        // Fallback to mock data if API fails
        setBookingsData({ 
          data: [
            {
              id: '1',
              customer_name: 'Alice Johnson',
              activity_id: '1',
              agent_id: '1',
              start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
              end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
              status: 'confirmed',
              total_price_usd: 80
            },
            {
              id: '2',
              customer_name: 'Bob Wilson',
              activity_id: '2',
              agent_id: '2',
              start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
              end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
              status: 'confirmed',
              total_price_usd: 60
            },
            {
              id: '3',
              customer_name: 'Carol Davis',
              activity_id: '1',
              agent_id: '1',
              start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
              end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
              status: 'pending',
              total_price_usd: 80
            }
          ] 
        });
      }
    };
    
    fetchBookings();
  }, []);

  // Mock mutation for now since Supabase is not connected
  const createBookingMutation = {
    isPending: false,
    mutateAsync: async (data: any) => {
      try {
        console.log('Creating booking:', data);
        
        // Call actual API
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          // 서버에서 온 구체적인 오류 메시지 사용
          const errorMessage = result.error || 'Failed to create booking';
          
          // 불가 날짜 관련 에러인지 확인
          if (errorMessage.includes('예약 불가 날짜') || errorMessage.includes('운영 중단일')) {
            // 사용자 친화적인 알림 표시
            toast({
              title: '예약 불가 날짜',
              description: errorMessage,
              variant: 'destructive',
            });
            return; // 에러를 다시 throw하지 않음
          }
          
          throw new Error(errorMessage);
        }
        
        // Refresh bookings data
        const refreshResponse = await fetch('/api/bookings');
        const refreshData = await refreshResponse.json();
        setBookingsData(refreshData);
        
        toast({
          title: 'Success',
          description: 'Booking created successfully',
        });
        
        setIsBookingSheetOpen(false);
        resetSelection();
        return result;
      } catch (error) {
        console.error('Failed to create booking:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw error;
      }
    },
  };

  // TODO: Uncomment when Supabase is connected
  // const createBookingMutation = useMutation({
  //   mutationFn: createBooking,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['bookings'] });
  //     toast({
  //       title: 'Success',
  //       description: 'Booking created successfully',
  //       setIsBookingSheetOpen(false);
  //       resetSelection();
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: 'Error',
  //       description: error.message || 'Failed to create booking',
  //       variant: 'destructive',
  //     });
  //   },
  // });

  const agents = (agentsData?.data || []) as Agent[];
  const activities = (activitiesData?.data || []) as Activity[];
  const bookings = (bookingsData?.data || []) as any[];

  // Convert bookings to calendar events
  const calendarEvents = useMemo(() => {
    return bookings.map((booking): CalendarEvent => {
      const activity = activities.find(a => a.id === booking.activity_id);
      let color = '#3b82f6'; // default blue
      
      // Set color based on booking status
      switch (booking.status) {
        case 'confirmed':
          color = '#10b981'; // green
          break;
        case 'pending':
          color = '#f59e0b'; // amber
          break;
        case 'cancelled':
          color = '#ef4444'; // red
          break;
        case 'completed':
          color = '#6b7280'; // gray
          break;
        default:
          color = '#3b82f6'; // blue
      }
      
      return {
        id: booking.id,
        title: `${booking.customer_name} - ${activity?.title_en || 'Unknown Activity'}`,
        start: new Date(booking.start_time),
        end: new Date(booking.end_time),
        type: 'booking',
        agent_id: booking.agent_id,
        booking_id: booking.id,
        color,
      };
    });
  }, [bookings, activities]);

  // Handle calendar interactions
  const handleEventClick = (event: CalendarEvent) => {
    // Find the full booking data
    const booking = bookings.find(b => b.id === event.booking_id);
    if (booking) {
      setSelectedBooking(booking);
      setIsBookingDetailSheetOpen(true);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsBookingSheetOpen(true);
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    // Create a new date object with the selected time
    const selectedDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    setSelectedDate(selectedDateTime);
    setIsBookingSheetOpen(true);
    
    console.log('Time slot clicked:', {
      date: date.toISOString(),
      time,
      selectedDateTime: selectedDateTime.toISOString(),
      localDateTime: selectedDateTime.toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' }),
      formattedTime: `${selectedDateTime.getFullYear()}-${String(selectedDateTime.getMonth() + 1).padStart(2, '0')}-${String(selectedDateTime.getDate()).padStart(2, '0')}T${String(selectedDateTime.getHours()).padStart(2, '0')}:${String(selectedDateTime.getMinutes()).padStart(2, '0')}`
    });
  };

  const handleBookingSubmit = async (data: CreateBookingRequest) => {
    await createBookingMutation.mutateAsync(data);
  };

  const handleBookingCancel = () => {
    setIsBookingSheetOpen(false);
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedDate(null);
    setSelectedAgentId(null);
    setSelectedActivityId(null);
    setSelectedBooking(null);
    setIsBookingDetailSheetOpen(false);
  };

  // Calculate summary statistics
  const todayBookings = useMemo(() => {
    const today = new Date();
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time);
      return bookingDate.toDateString() === today.toDateString();
    });
  }, [bookings]);

  const confirmedBookings = useMemo(() => {
    return todayBookings.filter(booking => booking.status === BookingStatus.CONFIRMED);
  }, [todayBookings]);

  const totalRevenue = useMemo(() => {
    return confirmedBookings.reduce((sum, booking) => sum + booking.total_price_usd, 0);
  }, [confirmedBookings]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar & Bookings</h1>
          <p className="text-gray-600">Manage your schedule and create new bookings</p>
        </div>
        
        <Sheet open={isBookingSheetOpen} onOpenChange={setIsBookingSheetOpen}>
          <SheetTrigger asChild>
            <Button
              onClick={() => {
                // Set current date when opening from button
                const now = new Date();
                setSelectedDate(now);
                
                console.log('New Booking button clicked:', {
                  now: now.toISOString(),
                  localNow: now.toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' })
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New Booking</SheetTitle>
              <SheetDescription>
                Fill in the details to create a new booking
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <BookingForm
                agents={agents}
                activities={activities}
                selectedDate={selectedDate || undefined}
                selectedAgentId={selectedAgentId || undefined}
                selectedActivityId={selectedActivityId || undefined}
                onSubmit={handleBookingSubmit}
                onCancel={handleBookingCancel}
                isLoading={createBookingMutation.isPending}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Total bookings for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Today's revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.filter(a => a.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              Active agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="h-[800px]">
        <CardContent className="p-0 h-full">
          <Calendar
            events={calendarEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onTimeSlotClick={handleTimeSlotClick}
            className="h-full"
          />
        </CardContent>
      </Card>

      {/* Booking Detail Sheet */}
      <Sheet open={isBookingDetailSheetOpen} onOpenChange={setIsBookingDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Booking Details</SheetTitle>
            <SheetDescription>
              View detailed information about the selected booking
            </SheetDescription>
          </SheetHeader>
          {selectedBooking && (
            <BookingDetailSheet
              event={calendarEvents.find(e => e.booking_id === selectedBooking.id) || {} as CalendarEvent}
              booking={selectedBooking}
              activity={activities.find(a => a.id === selectedBooking.activity_id)}
              agent={agents.find(a => a.id === selectedBooking.agent_id)}
              onClose={() => setIsBookingDetailSheetOpen(false)}
              onEdit={() => {
                // TODO: Implement edit functionality
                console.log('Edit booking:', selectedBooking);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
