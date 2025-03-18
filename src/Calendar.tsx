import React, { useState, useEffect } from 'react';
import './Calendar.css';

interface CalendarDay {
  date: number;
  assignedPerson: string | null;
  isCurrentMonth: boolean;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendar, setCalendar] = useState<(CalendarDay | null)[]>([]);
  const [employees, setEmployees] = useState<string[]>([
    'John Smith',
    'Emma Johnson',
    'Michael Brown',
    'Sarah Davis',
    'Robert Wilson'
  ]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  
  // Generate calendar days for current month
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and total days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create calendar array with empty slots and days
    const calendarDays: (CalendarDay | null)[] = Array(42).fill(null);
    
    // Fill the array with day information
    for (let i = 0; i < daysInMonth; i++) {
      const dayIndex = firstDay + i;
      calendarDays[dayIndex] = {
        date: i + 1,
        assignedPerson: null,
        isCurrentMonth: true
      };
    }
    
    // Previous month days
    const prevMonthDays = firstDay;
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = 0; i < prevMonthDays; i++) {
      calendarDays[i] = {
        date: daysInPrevMonth - prevMonthDays + i + 1,
        assignedPerson: null,
        isCurrentMonth: false
      };
    }
    
    // Next month days
    const remainingSlots = 42 - (prevMonthDays + daysInMonth);
    for (let i = 0; i < remainingSlots; i++) {
      calendarDays[prevMonthDays + daysInMonth + i] = {
        date: i + 1,
        assignedPerson: null,
        isCurrentMonth: false
      };
    }
    
    setCalendar(calendarDays);
  }, [currentDate]);
  
  // Navigate to previous month
  const prevMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Assign person to a day
  const assignPerson = (index: number, person: string | null): void => {
    const updatedCalendar = [...calendar];
    if (updatedCalendar[index]) {
      updatedCalendar[index] = {
        ...updatedCalendar[index] as CalendarDay,
        assignedPerson: person
      };
      setCalendar(updatedCalendar);
    }
  };
  
  // Get month and year string
  const getMonthYearString = (): string => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return currentDate.toLocaleDateString('en-US', options);
  };
  
  // Get day of week
  const getDayOfWeek = (index: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[index % 7];
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button 
          className="nav-button"
          onClick={prevMonth}
        >
          Previous
        </button>
        <h2 className="month-title">{getMonthYearString()}</h2>
        <button 
          className="nav-button"
          onClick={nextMonth}
        >
          Next
        </button>
        {/*<button 
          className="darkmode"
          onClick={toggleTheme}
        >
          dark mode
        </button>*/}
      </div>
      
      <div className="calendar-grid">
        {calendar.map((day, index) => (
          <div 
            key={index}
            className={`day-card ${day?.isCurrentMonth ? 'current-month' : 'other-month'} `}
          >
            {day && (
              <>
                <div className="day-content">
                <div className={`day-header-combined ${isDarkMode? 'darkmode':''}
                ${getDayOfWeek(index) === 'Fri' || getDayOfWeek(index) === 'Sat' ?
                  day?.assignedPerson ? 'weekend-assigned-header': "weekend-header":
                  day?.assignedPerson ? "assigned-header" : ''}`}>
                    {day.date} - {getDayOfWeek(index)}
                </div>
                  
                  <div className="assignment-container">
                    {day.assignedPerson && (
                      <div className="assigned-person">
                        {day.assignedPerson}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="hover-overlay">
                  <div className="person-selector">
                    <select 
                      className="person-dropdown"
                      value={day.assignedPerson || ''}
                      onChange={(e) => assignPerson(index, e.target.value || null)}
                    >
                      <option value="">Select person</option>
                      {employees.map(person => (
                        <option key={person} value={person}>
                          {person}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;