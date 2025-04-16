import React, { useState, useEffect, useContext } from 'react';
import './Calendar.css';
import { AppContext } from './AppContext.tsx';
import { Intern, Shift, createShift, fauxShift, createFauxShift } from './API_Services/Models.tsx';
import shiftService from './API_Services/shiftService.tsx';

interface CalendarDay {
  date: Date;
  intern: Intern | null;
  isCurrentMonth: boolean;
}

function Calendar() {
  // State management
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [pendingChanges, setPendingChanges] = useState<fauxShift[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  // Add loading state for save operation
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Get interns from context
  const { allInterns } = useContext(AppContext) || { allInterns: [] };
  
  if (!allInterns) {
    throw new Error("allInterns must be available in AppContext");
  }
  
  // fetches all database registered shifts, only does this on mount.
  useEffect(() => {
    (async () => {
      try {
        const shifts = await shiftService.getAllShifts();
        setAllShifts(shifts);
      } catch (err) {
        console.error('Error fetching shifts:', err);
      }
    })(); //the last two parentheses actually invoke this unnamed async function, that's why they're there.
  }, []);
  
  // Generate calendar grid
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Calculate grid parameters
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate(); //third argument being 0 represents grabbing the last day of the previous month, which allows us to count the days
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Create new calendar array
    const newCalendar: CalendarDay[] = [];
    
    // Add previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
      newCalendar.push({
        date: new Date(year, month - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
        intern: null,
        isCurrentMonth: false
      });
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      newCalendar.push({
        date: new Date(year, month, i),
        intern: null,
        isCurrentMonth: true
      });
    }
    
    // Add next month days (to complete the grid of 6 weeks)
    const remainingSlots = 42 - newCalendar.length;
    for (let i = 1; i <= remainingSlots; i++) {
      newCalendar.push({
        date: new Date(year, month + 1, i),
        intern: null,
        isCurrentMonth: false
      });
    }
    
    // First apply pending changes to show user's unsaved work
    for (let i = 0; i < newCalendar.length; i++) {
      const day = newCalendar[i];
      // Look for a pending change for this day
      const pendingShift = pendingChanges.find(shift => 
        isSameDay(new Date(shift.shiftDate), day.date)
      );
      
      if (pendingShift) {
        // Apply pending change
        const assignedIntern = allInterns.find(
          intern => intern.id === pendingShift.internId
        );
        
        if (assignedIntern) {
          newCalendar[i] = {
            ...day,
            intern: assignedIntern
          };
          continue; // Skip checking server shifts for this day
        }
      }
      
      // Apply server shifts for days without pending changes
      if (allShifts.length > 0) {
        const matchingShift = allShifts.find(shift => 
          isSameDay(new Date(shift.shiftDate), day.date)
        );
        
        if (matchingShift) {
          const assignedIntern = allInterns.find(
            intern => intern.id === matchingShift.internId
          );
          
          if (assignedIntern) {
            newCalendar[i] = {
              ...day,
              intern: assignedIntern
            };
          }
        }
      }
    }
    
    setCalendar(newCalendar);
  }, [currentDate, allShifts, allInterns, pendingChanges]); // Added pendingChanges as a dependency
  
  // Navigation functions
  const changeMonth = (delta: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  // Helper function to compare dates (ignoring time)
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };
  
  // Get day abbreviation
  const getDayOfWeek = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };
  
  // Check if a day is a weekend
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 5 || day === 6; // Friday or Saturday
  };
  
  const assignIntern = (index: number, intern: Intern | null) => {
    const day = calendar[index];
    const station = 0; //should be changed to currentStation later
    if (!day) return;
    
    // Update calendar immediately for visual feedback
    setCalendar(prevCalendar => {
      const updatedCalendar = [...prevCalendar];
      updatedCalendar[index] = {
        ...updatedCalendar[index],
        intern: intern
      };
      return updatedCalendar;
    });
    
    if (intern) {
      const newShift = createFauxShift(intern.id, day.date, 0);
      
      setPendingChanges(prevPendingChanges => {
        // Check if we already have a pending shift for this date
        const existingIndex = prevPendingChanges.findIndex(shift => 
          isSameDay(new Date(shift.shiftDate), day.date) && 
          shift.stationNum === newShift.stationNum
        );
        
        if (existingIndex >= 0) {
          // Replace the existing shift
          const newPendingChanges = [...prevPendingChanges];
          newPendingChanges[existingIndex] = newShift;
          return newPendingChanges;
        } else {
          // Add a new shift
          return [...prevPendingChanges, newShift];
        }
      });
    } else {
      // If intern is null (unassigning), remove any pending shift for this date
      setPendingChanges(prevPendingChanges => prevPendingChanges.filter(shift => 
                                      !(isSameDay(new Date(shift.shiftDate), day.date) && 
                                      shift.stationNum === station)
      ));                                
    }
  };

  // Function to save current shift and update the shifts array
  const saveShiftAndUpdateData = async () => {
    if (pendingChanges.length === 0) return; //shouldn't really be accessed anyway
    
    // Set loading state
    setIsSaving(true);
    
    try {
      const savedShifts: Shift[] = [];
      
      // Process each pending shift using forEach
      for (const pendingShift of pendingChanges) {
        // Check if a shift for that date and station already exists
        const oldShift = allShifts.find(shift => 
          isSameDay(new Date(shift.shiftDate), new Date(pendingShift.shiftDate)) && 
          shift.stationNum === pendingShift.stationNum
        );
        
        let savedShift: Shift;
        if (oldShift) {
          savedShift = await shiftService.changeShift(pendingShift.internId, oldShift);
        } else {
          savedShift = await shiftService.addShift(pendingShift);
        }
        
        savedShifts.push(savedShift);
      }
      
      // Update local shifts array with all saved shifts
      setAllShifts(prevShifts => {
        const newShifts = [...prevShifts];
        
        // Update or add each saved shift
        savedShifts.forEach(savedShift => {
          const existingIndex = newShifts.findIndex(s => s.id === savedShift.id);
          if (existingIndex >= 0) {
            newShifts[existingIndex] = savedShift;
          } else {
            newShifts.push(savedShift);
          }
        });
        
        return newShifts;
      });
      
      // Clear pending changes after saving
      setPendingChanges([]);
    } catch (err) {
      console.error('Error saving shifts:', err);
    } finally {
      // Clear loading state
      setIsSaving(false);
    }
  };

  
  // Get CSS class for day header based on assignment and weekend status
  const getDayHeaderClass = (day: CalendarDay) => {
    const baseClass = 'day-header-combined';
    
    if (isWeekend(day.date)) {
      return day.intern 
        ? `${baseClass} weekend-assigned-header` 
        : `${baseClass} weekend-header`;
    }
    
    return day.intern 
      ? `${baseClass} assigned-header` 
      : baseClass;
  };
  
  // Check if a day has a pending change
  const hasPendingChange = (day: CalendarDay) => {
    return pendingChanges.some(shift => 
      isSameDay(new Date(shift.shiftDate), day.date)
    );
  };
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button 
          className="nav-button"
          onClick={() => changeMonth(-1)}>
          Previous
        </button>

        <h2 className="month-title">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>

        <button 
          className="nav-button"
          onClick={() => changeMonth(1)}>
          Next
        </button>
      </div>
      
      <div className="calendar-grid">
        {calendar.map((day, index) => (
          <div 
            key={index}
            className={`day-card ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${hasPendingChange(day) ? 'pending-change' : ''}`}
          >
            <div className="day-content">
              <div className={getDayHeaderClass(day)}>
                {day.date.getDate()} - {getDayOfWeek(day.date)}
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
                    const internId = Number(e.target.value);
                    const selectedIntern = internId 
                      ? allInterns.find(i => i.id === internId) 
                      : null;
                    assignIntern(index, selectedIntern || null);
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
          </div>
        ))}
      </div>

      <button 
        className="save-button"
        disabled={pendingChanges.length === 0 || isSaving}
        onClick={saveShiftAndUpdateData}>
        {isSaving ? 'Saving...' : `Save Changes (${pendingChanges.length})`}
      </button>
    </div>
  );
}

export default Calendar;