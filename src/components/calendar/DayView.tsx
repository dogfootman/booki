'use client';

import React, { useMemo } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { CalendarEvent } from '@/types/booking';
import { generateTimeSlots, filterEventsByDate } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  date,
  events,
  onEventClick,
  onTimeSlotClick,
}) => {
  const timeSlots = useMemo(() => {
    return generateTimeSlots(8, 20, 30); // 8 AM to 8 PM, 30-minute intervals
  }, []);

  const dayEvents = useMemo(() => {
    return filterEventsByDate(events, date);
  }, [events, date]);

  const handleTimeSlotClick = (time: string) => {
    if (onTimeSlotClick) {
      const [hours, minutes] = time.split(':').map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(hours, minutes, 0, 0);
      onTimeSlotClick(slotDate, time);
    }
  };

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = endMinutes - startMinutes;
    
    const top = ((startMinutes - 8 * 60) / (12 * 60)) * 100; // 8 AM to 8 PM = 12 hours
    const height = (duration / (12 * 60)) * 100;
    
    return { top: `${top}%`, height: `${height}%` };
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Day Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className={cn(
            'text-lg font-semibold',
            isToday(date) ? 'text-blue-600' : 'text-gray-900'
          )}>
            {format(date, 'EEEE, MMMM d, yyyy')}
          </h3>
          {isToday(date) && (
            <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
              Today
            </span>
          )}
        </div>
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative min-h-[1200px]"> {/* 20 hours * 60px per hour */}
          {/* Time Labels */}
          <div className="absolute left-0 top-0 w-20 h-full border-r bg-gray-50">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className={cn(
                  'h-[60px] border-b border-gray-200 px-2 py-1 text-xs text-gray-500 flex items-center',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                )}
              >
                {time}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="ml-20 relative">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className={cn(
                  'h-[60px] border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                )}
                onClick={() => handleTimeSlotClick(time)}
              />
            ))}

            {/* Events */}
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={cn(
                  'absolute left-0 right-0 mx-1 rounded-md p-2 text-xs text-white cursor-pointer shadow-sm',
                  'hover:shadow-md transition-shadow'
                )}
                style={{
                  ...getEventPosition(event),
                  backgroundColor: event.color || '#3b82f6'
                }}
                onClick={() => onEventClick?.(event)}
              >
                <div className="font-medium truncate">{event.title}</div>
                <div className="text-xs opacity-90">
                  {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
