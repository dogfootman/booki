'use client';

import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, DollarSign, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent, BookingStatus } from '@/types/booking';
import { Activity } from '@/types/activity';
import { Agent } from '@/types/agent';

interface BookingDetailSheetProps {
  event: CalendarEvent;
  booking: any; // Full booking data
  activity?: Activity;
  agent?: Agent;
  onClose: () => void;
  onEdit?: () => void;
}

export const BookingDetailSheet: React.FC<BookingDetailSheetProps> = ({
  event,
  booking,
  activity,
  agent,
  onClose,
  onEdit,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleCancelBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      const result = await response.json();
      
      if (result.success) {
        // Close the sheet and refresh data
        onClose();
        
        // Show success message
        // Note: You might want to use a toast notification here
        alert('Booking cancelled successfully');
        
        // Refresh the page to update the calendar
        window.location.reload();
      } else {
        throw new Error(result.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Close Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <Badge className={getStatusColor(booking.status)}>
          {getStatusText(booking.status)}
        </Badge>
      </div>

      {/* Activity Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span>Activity</span>
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-medium text-gray-900">
            {activity?.title_en || 'Unknown Activity'}
          </div>
          {activity?.description_en && (
            <p className="text-gray-600 mt-1">{activity.description_en}</p>
          )}
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span>Duration: {activity?.duration_minutes || 0} min</span>
            <span>Max Participants: {activity?.max_participants || 0}</span>
          </div>
        </div>
      </div>

      {/* Schedule Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-green-600" />
          <span>Schedule</span>
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Date:</span>
            <span className="font-medium">
              {format(new Date(booking.start_time), 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Time:</span>
            <span className="font-medium">
              {format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Participants:</span>
            <span className="font-medium">{booking.participants}</span>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <User className="h-5 w-5 text-purple-600" />
          <span>Customer</span>
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Name:</span>
            <span className="font-medium">{booking.customer_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Email:</span>
            <span className="font-medium">{booking.customer_email}</span>
          </div>
          {booking.customer_phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Phone:</span>
              <span className="font-medium">{booking.customer_phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Agent Information (if assigned) */}
      {agent && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <User className="h-5 w-5 text-indigo-600" />
            <span>Assigned Agent</span>
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-lg font-medium text-gray-900">{agent.name}</div>
            {agent.email && (
              <div className="text-sm text-gray-600 mt-1">{agent.email}</div>
            )}
            {agent.phone && (
              <div className="text-sm text-gray-600">{agent.phone}</div>
            )}
          </div>
        </div>
      )}

      {/* Price Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span>Pricing</span>
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            ${booking.total_price_usd.toFixed(2)}
          </div>
          {activity && (
            <div className="text-sm text-gray-600 mt-1">
              ${activity.price_usd} per person × {booking.participants} participants
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-orange-600" />
            <span>Notes</span>
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{booking.notes}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {booking.status !== 'cancelled' && (
          <Button 
            variant="outline" 
            onClick={handleCancelBooking}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Cancel Booking
          </Button>
        )}
        {onEdit && (
          <Button onClick={onEdit}>
            Edit Booking
          </Button>
        )}
      </div>
    </div>
  );
};
