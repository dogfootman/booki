'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { createBookingSchema, CreateBookingRequest } from '@/types/booking';
import { Agent } from '@/types';
import { Activity, DailyScheduleTimeSlot } from '@/types/activity';
import { useToast } from '@/hooks/use-toast';

interface BookingFormProps {
  agents: Agent[];
  activities: Activity[];
  selectedDate?: Date;
  selectedAgentId?: string;
  selectedActivityId?: string;
  onSubmit: (data: CreateBookingRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  agents,
  activities,
  selectedDate,
  selectedAgentId,
  selectedActivityId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(createBookingSchema),
    mode: 'onChange',
    defaultValues: {
      start_time: '',
      end_time: '',
      activity_id: '',
      agent_id: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      participants: 1,
      total_price_usd: 0,
      notes: '',
    },
  });

  const watchedActivityId = watch('activity_id');
  const watchedAgentId = watch('agent_id');
  const watchedParticipants = watch('participants');
  const watchedStartTime = watch('start_time');
  const watchedEndTime = watch('end_time');
  const watchedCustomerName = watch('customer_name');
  const watchedCustomerEmail = watch('customer_email');

  // Set initial values
  useEffect(() => {
    if (selectedDate) {
      // Reset time slots when date changes
      setValue('start_time', '');
      setValue('end_time', '');
    } else {
      // Ensure inputs are never undefined
      setValue('start_time', '');
      setValue('end_time', '');
    }
    
    if (selectedAgentId) {
      setValue('agent_id', selectedAgentId);
    } else {
      setValue('agent_id', '');
    }
    
    if (selectedActivityId) {
      setValue('activity_id', selectedActivityId);
    } else {
      setValue('activity_id', '');
    }
  }, [selectedDate, selectedAgentId, selectedActivityId, setValue]);

  // Update selected activity and agent when IDs change
  useEffect(() => {
    if (watchedActivityId) {
      const activity = activities.find(a => a.id === watchedActivityId);
      setSelectedActivity(activity || null);
      
      // Auto-set participants to minimum if current value is less than minimum
      if (activity && watchedParticipants < activity.min_participants) {
        setValue('participants', activity.min_participants);
      }
      
      // Auto-calculate total price
      if (activity) {
        const participants = Math.max(watchedParticipants || 1, activity.min_participants);
        const totalPrice = activity.price_usd * participants;
        setValue('total_price_usd', totalPrice);
      }
    } else {
      setSelectedActivity(null);
    }
  }, [watchedActivityId, activities, watchedParticipants, setValue]);

  useEffect(() => {
    if (watchedAgentId) {
      const agent = agents.find(a => a.id === watchedAgentId);
      setSelectedAgent(agent || null);
    }
  }, [watchedAgentId, agents]);

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data as CreateBookingRequest);
    } catch (error) {
      console.error('Failed to submit booking:', error);
      const errorMessage = error instanceof Error ? error.message : '예약 생성에 실패했습니다.';
      toast({
        title: '예약 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleActivityChange = (activityId: string) => {
    setValue('activity_id', activityId);
  };

  const handleAgentChange = (agentId: string) => {
    setValue('agent_id', agentId);
  };

  const handleParticipantsChange = (participants: number) => {
    setValue('participants', participants);
    
    // Recalculate total price
    if (selectedActivity) {
      const totalPrice = selectedActivity.price_usd * participants;
      setValue('total_price_usd', totalPrice);
    }
  };

  // Get available time slots for the selected date and activity
  const getAvailableTimeSlots = (date: Date, activity: Activity) => {
    const dayOfWeek = date.getDay();
    const dailySchedule = activity.daily_schedules?.find(schedule => schedule.day_of_week === dayOfWeek);
    
    if (!dailySchedule) return [];
    
    return dailySchedule.time_slots
      .filter(slot => slot.is_available && (slot.current_bookings || 0) < (slot.max_capacity || 0))
      .map(slot => ({
        id: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isAvailable: slot.is_available && (slot.current_bookings || 0) < (slot.max_capacity || 0),
        availableSpots: (slot.max_capacity || 0) - (slot.current_bookings || 0),
        formattedStartTime: `${format(date, 'yyyy-MM-dd')}T${slot.start_time}`,
        formattedEndTime: `${format(date, 'yyyy-MM-dd')}T${slot.end_time}`,
      }));
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: ReturnType<typeof getAvailableTimeSlots>[0]) => {
    setValue('start_time', slot.formattedStartTime);
    setValue('end_time', slot.formattedEndTime);
  };

  // Get operating days for an activity
  const getOperatingDays = (activity: Activity): string => {
    if (!activity.daily_schedules || activity.daily_schedules.length === 0) {
      return 'No schedule available';
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const operatingDays = activity.daily_schedules
      .map(schedule => dayNames[schedule.day_of_week])
      .join(', ');
    
    return operatingDays;
  };

  // Check if all required fields are filled
  const isFormValid = watchedActivityId && 
                     watchedStartTime && 
                     watchedEndTime && 
                     watchedCustomerName && 
                     watchedCustomerEmail && 
                     watchedParticipants > 0;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Selected Date Display */}
      {selectedDate && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-800">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Selected Date:</span>
          </div>
          <div className="mt-2 text-sm text-blue-700">
            <div>📅 Date: {format(selectedDate, 'EEEE, MMMM d, yyyy')}</div>
          </div>

        </div>
      )}

      {/* Activity Selection */}
      <div className="space-y-2">
        <Label htmlFor="activity_id">Activity *</Label>
        <Select value={watchedActivityId} onValueChange={handleActivityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an activity" />
          </SelectTrigger>
          <SelectContent>
            {activities.map((activity) => (
              <SelectItem key={activity.id} value={activity.id}>
                {activity.title_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.activity_id && (
          <p className="text-sm text-red-600">{errors.activity_id.message}</p>
        )}
      </div>

      {/* Agent Selection */}
      <div className="space-y-2">
        <Label htmlFor="agent_id">Agent (Optional)</Label>
        <Select value={watchedAgentId} onValueChange={handleAgentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.agent_id && (
          <p className="text-sm text-red-600">{errors.agent_id.message}</p>
        )}
      </div>

      {/* Schedule & Time Slots */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-medium text-gray-900">Schedule & Time Slots</h3>
          <p className="text-sm text-gray-500">Select available time slot for your booking</p>
        </div>
        
        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="booking_date">Booking Date *</Label>
          <Input
            id="booking_date"
            type="date"
            value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const date = new Date(e.target.value);
              setValue('start_time', '');
              setValue('end_time', '');
            }}
            className="w-full text-base"
            min={format(new Date(), 'yyyy-MM-dd')}
          />
          {errors.start_time && (
            <p className="text-sm text-red-600">{errors.start_time.message}</p>
          )}
        </div>

        {/* Time Slot Selection */}
        {selectedDate && selectedActivity && (
          <div className="space-y-3">
            <Label>Available Time Slots</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {getAvailableTimeSlots(selectedDate, selectedActivity).map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleTimeSlotSelect(slot)}
                  className={cn(
                    'p-3 border rounded-lg text-sm font-medium transition-colors',
                    'hover:border-blue-500 hover:bg-blue-50',
                    watch('start_time') === slot.formattedStartTime
                      ? 'border-blue-600 bg-blue-100 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700'
                  )}
                  disabled={!slot.isAvailable}
                >
                  <div className="text-center">
                    <div className="font-semibold">{slot.startTime}</div>
                    <div className="text-xs text-gray-500">{slot.endTime}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {slot.availableSpots} spots left
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {getAvailableTimeSlots(selectedDate, selectedActivity).length === 0 && (
              <div className="text-center py-6">
                <div className="text-gray-400 mb-2">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  No available time slots for this date
                </p>
                <p className="text-xs text-gray-400">
                  This activity operates on specific days. Try selecting a different date.
                </p>
                <div className="mt-3 text-xs text-gray-400">
                  <p><strong>Operating Days:</strong></p>
                  <p>{getOperatingDays(selectedActivity)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Time Display */}
        {watch('start_time') && watch('end_time') && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Selected Schedule:</span>
            </div>
            <div className="mt-2 text-sm text-blue-700">
              <div>📅 Date: {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}</div>
              <div>🕐 Time: {watch('start_time')} - {watch('end_time')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer_name">Customer Name *</Label>
          <Input
            id="customer_name"
            {...register('customer_name')}
            placeholder="Enter customer name"
          />
          {errors.customer_name && (
            <p className="text-sm text-red-600">{errors.customer_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_email">Customer Email *</Label>
          <Input
            id="customer_email"
            type="email"
            {...register('customer_email')}
            placeholder="Enter customer email"
          />
          {errors.customer_email && (
            <p className="text-sm text-red-600">{errors.customer_email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_phone">Customer Phone</Label>
        <Input
          id="customer_phone"
          {...register('customer_phone')}
          placeholder="Enter customer phone (optional)"
        />
        {errors.customer_phone && (
          <p className="text-sm text-red-600">{errors.customer_phone.message}</p>
        )}
      </div>

      {/* Booking Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="participants">Participants *</Label>
          <Input
            id="participants"
            type="number"
            min={selectedActivity?.min_participants || 1}
            max={selectedActivity?.max_participants || 1000}
            {...register('participants', { valueAsNumber: true })}
            onChange={(e) => handleParticipantsChange(parseInt(e.target.value) || 1)}
          />
          {errors.participants && (
            <p className="text-sm text-red-600">{errors.participants.message}</p>
          )}
          {selectedActivity && (
            <p className="text-xs text-gray-500">
              최소: {selectedActivity.min_participants}명, 최대: {selectedActivity.max_participants}명
            </p>
          )}
        </div>
      </div>

      {/* Price Information */}
      <div className="space-y-2">
        <Label htmlFor="total_price_usd">Total Price (USD) *</Label>
        <Input
          id="total_price_usd"
          type="number"
          step="0.01"
          min="0"
          {...register('total_price_usd', { valueAsNumber: true })}
          readOnly
        />
        {errors.total_price_usd && (
          <p className="text-sm text-red-600">{errors.total_price_usd.message}</p>
        )}
        {selectedActivity && (
          <p className="text-xs text-gray-500">
            ${selectedActivity.price_usd} per person × {watchedParticipants || 0} participants
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Add any special requirements or notes"
          rows={3}
        />
        {errors.notes && (
          <p className="text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Booking'}
        </Button>
      </div>
    </form>
  );
};
