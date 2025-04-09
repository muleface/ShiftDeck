import React, { useState, useEffect, useContext } from 'react';
import './Calendar.css';
import { AppContext } from './AppContext';
import {Intern,Shift,createShift, Login, createLogin} from './API_Services/Models.tsx';
import shiftService from './API_Services/shiftService.tsx';
import loginService from './API_Services/loginService.tsx';

interface CalendarDay {
  date: Date;
  intern: Intern | null;
  isCurrentMonth: boolean;
}

function Calendar(){
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [calendar, setCalendar] = useState<(CalendarDay | null)[]>([]);
  const [shift, setshift] = useState<(Shift | null)>(null);
  const [logintest, setlogintest] = useState<(Login)>({username:"omer",userPassword:"1234",id:1,status:1});
  const [id, setid] = useState<(number)>(0);
  const [allShifts, setAllShifts] = useState<(Shift[])>([]);
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }

  const { allInterns } = context;
  
  useEffect(() => {
    shiftService.getAllShifts()
      .then(data => {
        setAllShifts(data);
  
        // Update the calendar with the correct interns for each shift
        setCalendar(prevCalendar => {
          return prevCalendar.map(day => {
            if (!day) return null; // Skip empty days
  
            // Find a shift that matches this date
            const shiftForDay = data.find(shift =>
              new Date(shift.shiftDate).toDateString() === day.date.toDateString()
            );
  
            if (shiftForDay) {
              // Find the intern assigned to this shift
              const assignedIntern = allInterns.find(intern => intern.id === shiftForDay.internId);
              
              return {
                ...day,
                intern: assignedIntern || null
              };
            }
  
            return day;
          });
        });
      })
      .catch(err => {
        console.error('Error fetching all shifts:', err);
      });
  }, [currentDate]);

  // Generate calendar days for current month
  useEffect(() => {
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays: (CalendarDay | null)[] = Array(42).fill(null);


    //fill the array with day info
    for (let i = 0; i < daysInMonth; i++) {
      calendarDays[i+firstDay] = {
        date: new Date(year, month, i + 1),
        intern: null,
        isCurrentMonth: true
      };
    }
    
    // Previous month days
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      calendarDays[i] = {
        date: new Date(year, month - 1, daysInPrevMonth - firstDay + i + 1),
        intern: null,
        isCurrentMonth: false
      };
    }
    
    // Next month days
    const remainingSlots = 42 - (firstDay + daysInMonth);
    for (let i = 0; i < remainingSlots; i++) {
      calendarDays[firstDay + daysInMonth + i] = {
        date: new Date(year, month + 1, i + 1),
        intern: null,
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
  const assignPerson = (index: number, newintern: Intern | null): void => {
    setCalendar(prevCalendar => {
      const updatedCalendar = [...prevCalendar];
  
      if (updatedCalendar[index]) {
        updatedCalendar[index] = {
          ...updatedCalendar[index] as CalendarDay,
          intern: newintern
        };
        const s=createShift(id,1,updatedCalendar[index].date,1);
        setid(i=>i++);
        // Create a shift only if newintern is not null and the date exists
        setshift(s);
      }
  
      return updatedCalendar;
    });
  };


  
  // Get day of week
  const getDayOfWeek = (index: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[index % 7];
  };

  

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button 
          className="nav-button"
          onClick={prevMonth}>
          Previous
        </button>

        {/*month and year */}
        <h2 className="month-title">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>

        <button 
          className="nav-button"
          onClick={nextMonth}>
          Next
        </button>
      </div>
      
      <div className="calendar-grid">
        {calendar.map((day, index) => (
          <div 
          key={index}
          className={`day-card 
          ${day?.isCurrentMonth ? 'current-month' : 'other-month'} `}
          >
            
            {day && (
              <>
                <div className="day-content">
                  <div className={`day-header-combined
                  ${getDayOfWeek(index) === 'Fri' || getDayOfWeek(index) === 'Sat' ?
                  day?.intern ? 'weekend-assigned-header': "weekend-header":
                  day?.intern ? "assigned-header" : ''}`}
                  >
                    {day.date.getDate()} - {getDayOfWeek(index)}
                  </div>
                  
                  <div className="assignment-container">
                    {day.intern && (
                      <div className="assigned-person">
                        {day.intern.firstName} {day.intern.lastName} 
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="hover-overlay">
                  <div className="person-selector">

                  <select
                  className="person-dropdown"
                  value={day.intern ? day.intern.id : ''}
                  onChange={(e) => {
                    const selectedIntern = allInterns.find(i => i.id === Number(e.target.value));
                    assignPerson(index, selectedIntern || null);
                  }}>

                    <option value="">Select person</option>
                    {allInterns.map(intern => (
                    <option key={intern.id} value={intern.id}>
                    {intern.firstName} {intern.lastName}
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


      <button 
      onClick={() => {
        if (shift !== null) {
        shiftService.addShift(shift);
      }
      }}>
        Save Changes
      </button>
    </div>
  );
};

export default Calendar;