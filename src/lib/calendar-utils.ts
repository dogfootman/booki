import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isSameDay, isSameMonth, isToday, getDay, getDate } from 'date-fns';
import { CalendarView, CalendarEvent } from '@/types/booking';

// Calendar navigation functions
export const getCalendarDates = (date: Date, view: CalendarView) => {
  switch (view) {
    case 'day':
      return [date];
    case 'week':
      const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // Sunday start
      const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    case 'month':
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      // Add padding days to fill the calendar grid
      const firstDayOfWeek = getDay(monthStart);
      const paddingStart = Array.from({ length: firstDayOfWeek }, (_, i) => 
        subDays(monthStart, firstDayOfWeek - i)
      );
      
      const lastDayOfWeek = getDay(monthEnd);
      const paddingEnd = Array.from({ length: 6 - lastDayOfWeek }, (_, i) => 
        addDays(monthEnd, i + 1)
      );
      
      return [...paddingStart, ...monthDays, ...paddingEnd];
    default:
      return [date];
  }
};

export const navigateCalendar = (currentDate: Date, view: CalendarView, direction: 'next' | 'prev'): Date => {
  switch (view) {
    case 'day':
      return direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
    case 'week':
      return direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
    case 'month':
      return direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
    default:
      return currentDate;
  }
};

// Date formatting functions
export const formatDate = (date: Date, formatString: string = 'yyyy-MM-dd'): string => {
  return format(date, formatString);
};

export const formatTime = (date: Date, formatString: string = 'HH:mm'): string => {
  return format(date, formatString);
};

export const formatDateRange = (startDate: Date, endDate: Date, view: CalendarView): string => {
  switch (view) {
    case 'day':
      return format(startDate, 'EEEE, MMMM d, yyyy');
    case 'week':
      const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(startDate, { weekStartsOn: 0 });
      if (isSameMonth(weekStart, weekEnd)) {
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`;
      } else {
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      }
    case 'month':
      return format(startDate, 'MMMM yyyy');
    default:
      return format(startDate, 'yyyy-MM-dd');
  }
};

// Event filtering and grouping
export const filterEventsByDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => isSameDay(event.start, date));
};

export const filterEventsByDateRange = (events: CalendarEvent[], startDate: Date, endDate: Date): CalendarEvent[] => {
  return events.filter(event => 
    event.start >= startDate && event.end <= endDate
  );
};

export const groupEventsByDate = (events: CalendarEvent[], dates: Date[]): Map<string, CalendarEvent[]> => {
  const grouped = new Map<string, CalendarEvent[]>();
  
  dates.forEach(date => {
    const dateKey = formatDate(date);
    const dayEvents = filterEventsByDate(events, date);
    grouped.set(dateKey, dayEvents);
  });
  
  return grouped;
};

// Time slot calculations
export const generateTimeSlots = (startHour: number = 8, endHour: number = 18, intervalMinutes: number = 30): string[] => {
  const slots: string[] = [];
  const totalMinutes = (endHour - startHour) * 60;
  const intervals = Math.floor(totalMinutes / intervalMinutes);
  
  for (let i = 0; i <= intervals; i++) {
    const minutes = startHour * 60 + (i * intervalMinutes);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    slots.push(timeString);
  }
  
  return slots;
};

// Calendar grid helpers
export const getWeekDays = (locale: string = 'en-US'): string[] => {
  const baseDate = new Date(2024, 0, 1); // January 1, 2024 (Monday)
  const weekDays: string[] = [];
  
  for (let i = 0; i < 7; i++) {
    const day = addDays(baseDate, i);
    weekDays.push(format(day, 'EEE'));
  }
  
  return weekDays;
};

export const isCurrentDate = (date: Date): boolean => {
  return isToday(date);
};

export const isCurrentMonth = (date: Date): boolean => {
  return isSameMonth(date, new Date());
};

// Event conflict detection
export const hasEventConflict = (newEvent: CalendarEvent, existingEvents: CalendarEvent[]): boolean => {
  return existingEvents.some(event => 
    event.agent_id === newEvent.agent_id &&
    event.start < newEvent.end &&
    event.end > newEvent.start
  );
};

// Business hours validation
export const isWithinBusinessHours = (date: Date, startHour: number = 8, endHour: number = 18): boolean => {
  const hour = date.getHours();
  return hour >= startHour && hour < endHour;
};

// Date range utilities
export const getDateRangeForView = (date: Date, view: CalendarView): { start: Date; end: Date } => {
  switch (view) {
    case 'day':
      return { start: date, end: date };
    case 'week':
      return {
        start: startOfWeek(date, { weekStartsOn: 0 }),
        end: endOfWeek(date, { weekStartsOn: 0 })
      };
    case 'month':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date)
      };
    default:
      return { start: date, end: date };
  }
};
