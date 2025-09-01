'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarView, CalendarEvent } from '@/types/booking';
import { getCalendarDates, navigateCalendar, formatDateRange, getWeekDays } from '@/lib/calendar-utils';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';

interface CalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onEventClick,
  onDateClick,
  onTimeSlotClick,
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');

  const calendarDates = useMemo(() => {
    return getCalendarDates(currentDate, view);
  }, [currentDate, view]);

  const weekDays = useMemo(() => {
    return getWeekDays();
  }, []);

  const handleNavigate = (direction: 'next' | 'prev') => {
    setCurrentDate(prev => navigateCalendar(prev, view, direction));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewChange = (newView: string) => {
    setView(newView as CalendarView);
  };

  const renderCalendarView = () => {
    switch (view) {
      case 'day':
        return (
          <DayView
            date={currentDate}
            events={events}
            onEventClick={onEventClick}
            onTimeSlotClick={onTimeSlotClick}
          />
        );
      case 'week':
        return (
          <WeekView
            dates={calendarDates}
            weekDays={weekDays}
            events={events}
            onEventClick={onEventClick}
            onDateClick={onDateClick}
            onTimeSlotClick={onTimeSlotClick}
          />
        );
      case 'month':
        return (
          <MonthView
            dates={calendarDates}
            weekDays={weekDays}
            events={events}
            onEventClick={onEventClick}
            onDateClick={onDateClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="text-sm"
          >
            Today
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {formatDateRange(calendarDates[0], calendarDates[calendarDates.length - 1], view)}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={view} onValueChange={handleViewChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 overflow-auto">
        {renderCalendarView()}
      </div>
    </div>
  );
};
