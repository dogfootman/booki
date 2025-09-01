'use client';

import React, { useMemo } from 'react';
import { format, isSameDay, isToday, isSameMonth, getDate } from 'date-fns';
import { CalendarEvent } from '@/types/booking';
import { filterEventsByDate } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  dates: Date[];
  weekDays: string[];
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  dates,
  weekDays,
  events,
  onEventClick,
  onDateClick,
}) => {
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

  const handleEventClick = (event: CalendarEvent) => {
    onEventClick?.(event);
  };

  // Group dates into weeks for grid layout
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < dates.length; i += 7) {
      result.push(dates.slice(i, i + 7));
    }
    return result;
  }, [dates]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Month Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b">
        <div className="grid grid-cols-7 gap-px">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-100">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Month Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-rows-6 gap-px p-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-px">
              {week.map((date) => {
                const dateKey = format(date, 'yyyy-MM-dd');
                const dayEvents = eventsByDate.get(dateKey) || [];
                const isCurrentMonth = isSameMonth(date, new Date());
                const isCurrentDate = isToday(date);
                
                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      'min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors',
                      !isCurrentMonth && 'bg-gray-50 text-gray-400',
                      isCurrentDate && 'bg-blue-50 border-blue-300'
                    )}
                    onClick={() => handleDateClick(date)}
                  >
                    {/* Date Number */}
                    <div className={cn(
                      'text-sm font-medium mb-2',
                      isCurrentDate ? 'text-blue-600' : 'text-gray-900'
                    )}>
                      {getDate(date)}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                                          className="text-xs p-1 rounded cursor-pointer truncate text-white"
                style={{ backgroundColor: event.color || '#3b82f6' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      
                      {/* Show more events indicator */}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
