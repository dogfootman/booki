'use client';

import React, { useMemo } from 'react';
import { format, isSameDay, isToday, getDate } from 'date-fns';
import { CalendarEvent } from '@/types/booking';
import { generateTimeSlots, filterEventsByDate } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  dates: Date[];
  weekDays: string[];
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  dates,
  weekDays,
  events,
  onEventClick,
  onDateClick,
  onTimeSlotClick,
}) => {
  const timeSlots = useMemo(() => {
    return generateTimeSlots(8, 20, 30); // 8 AM to 8 PM, 30-minute intervals
  }, []);

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    dates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      grouped.set(dateKey, filterEventsByDate(events, date));
    });
    return grouped;
  }, [dates, events]);

  const handleDateClick = (date: Date) => {
    onDateClick?.(date);
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    onTimeSlotClick?.(date, time);
  };

  const getEventPosition = (event: CalendarEvent, date: Date) => {
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
      {/* Week Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b">
        <div className="grid grid-cols-8 gap-px">
          {/* Time column header */}
          <div className="bg-gray-100 p-2" />
          
          {/* Day headers */}
          {dates.map((date, index) => (
            <div
              key={date.toISOString()}
              className={cn(
                'p-2 text-center cursor-pointer hover:bg-gray-200 transition-colors',
                isToday(date) ? 'bg-blue-100 text-blue-700' : 'bg-white'
              )}
              onClick={() => handleDateClick(date)}
            >
              <div className="text-sm font-medium text-gray-500">
                {weekDays[index]}
              </div>
              <div className={cn(
                'text-lg font-semibold',
                isToday(date) ? 'text-blue-700' : 'text-gray-900'
              )}>
                {getDate(date)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative min-h-[1200px]"> {/* 20 hours * 60px per hour */}
          <div className="grid grid-cols-8 gap-px">
            {/* Time Labels Column */}
            <div className="bg-gray-50">
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

            {/* Day Columns */}
            {dates.map((date) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayEvents = eventsByDate.get(dateKey) || [];
              
              return (
                <div key={date.toISOString()} className="relative">
                  {timeSlots.map((time, index) => (
                    <div
                      key={time}
                                      className={cn(
                  'h-[60px] border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                )}
                      onClick={() => handleTimeSlotClick(date, time)}
                    />
                  ))}

                  {/* Events for this day */}
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                                      className={cn(
                  'absolute left-0 right-0 mx-1 rounded-md p-2 text-xs text-white cursor-pointer shadow-sm',
                  'hover:shadow-md transition-shadow'
                )}
                style={{
                  ...getEventPosition(event, date),
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
