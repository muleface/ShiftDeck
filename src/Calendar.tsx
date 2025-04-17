import React, { useState, useEffect, useContext, useRef } from 'react';
import './Calendar.css';
import { AppContext } from './AppContext.tsx';
import { Intern, Shift, Station, createFauxShift, fauxShift, StationRole, JSConstraint } from './API_Services/Models.tsx';
import shiftService from './API_Services/shiftService.tsx';
import InternDropdown from './InternDropdown';

interface CalendarDay {
  date: Date;
  assignments: {
    [stationNum: number]: Intern | null;
  };
  isWeekend: boolean;
}

interface ValidationResult {
  isValid: boolean;
  invalidReasons: string[];
}

interface DayValidationResult {
  isValid: boolean;
  stationResults: { [stationNum: number]: ValidationResult };
}

function Calendar() {
  // State management
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [pendingChanges, setPendingChanges] = useState<fauxShift[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // New state for validation
  const [validationResults, setValidationResults] = useState<{ [dayIndex: number]: DayValidationResult }>({});
  
  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState<{
    dayIndex: number, 
    stationNum: number
  } | null>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Ref for table container
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Get context data
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error("AppContext must be available");
  }
  
  const { allInterns, allStations, stationRoles, jsConstraints, userRole } = context;
  
  if (!allInterns || !allStations) {
    throw new Error("allInterns and allStations must be available in AppContext");
  }
  
  // Fetch all shifts on component mount
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const shifts = await shiftService.getAllShifts();
        setAllShifts(shifts);
      } catch (err) {
        console.error('Error fetching shifts:', err);
      }
    };
    
    fetchShifts();
  }, []);
  
  // Generate calendar days for the current month
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: CalendarDay[] = [];
    
    // Create each day in the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
      
      days.push({
        date,
        assignments: {},
        isWeekend
      });
    }
    
    // First apply existing shifts from the server
    if (allShifts.length > 0) {
      allShifts.forEach(shift => {
        const shiftDate = new Date(shift.shiftDate);
        // Check if this shift belongs to the current month
        if (shiftDate.getMonth() === month && shiftDate.getFullYear() === year) {
          const dayIndex = shiftDate.getDate() - 1; // Days are 1-indexed but array is 0-indexed
          if (days[dayIndex]) {
            const assignedIntern = allInterns.find(intern => intern.id === shift.internId);
            if (assignedIntern) {
              // Initialize assignments object if needed
              if (!days[dayIndex].assignments) {
                days[dayIndex].assignments = {};
              }
              
              days[dayIndex].assignments[shift.stationNum] = assignedIntern;
            }
          }
        }
      });
    }
    
    // Then apply pending changes to show user's unsaved work
    pendingChanges.forEach(pendingShift => {
      const pendingDate = new Date(pendingShift.shiftDate);
      if (pendingDate.getMonth() === month && pendingDate.getFullYear() === year) {
        const dayIndex = pendingDate.getDate() - 1;
        if (days[dayIndex]) {
          const assignedIntern = allInterns.find(intern => intern.id === pendingShift.internId);
          if (assignedIntern) {
            days[dayIndex].assignments[pendingShift.stationNum] = assignedIntern;
          }
        }
      }
    });
    
    setCalendarDays(days);
  }, [currentDate, allShifts, allInterns, pendingChanges, allStations]);
  
  // Validate the calendar days whenever they change
  useEffect(() => {
    if (!stationRoles || !jsConstraints) return;
    
    const newValidationResults: { [dayIndex: number]: DayValidationResult } = {};
    
    calendarDays.forEach((day, dayIndex) => {
      // Get previous day's assignments for consecutive day validation
      const previousDay = dayIndex > 0 ? calendarDays[dayIndex - 1] : null;
      
      // Run validation
      const result = validateDay(day, previousDay, dayIndex);
      newValidationResults[dayIndex] = result;
    });
    
    setValidationResults(newValidationResults);
  }, [calendarDays, stationRoles, jsConstraints]);
  
  // Function to validate a single day's schedule
  const validateDay = (
    currentDay: CalendarDay, 
    previousDay: CalendarDay | null,
    dayIndex: number
  ): DayValidationResult => {
    const result: DayValidationResult = {
      isValid: true,
      stationResults: {}
    };
    
    // Get all assigned stations for the current day
    const assignedStations = Object.keys(currentDay.assignments).map(Number);
    
    // Check each assigned station
    for (const stationNum of assignedStations) {
      const assignedIntern = currentDay.assignments[stationNum];
      if (!assignedIntern) continue; // Skip empty assignments
      
      const stationResult: ValidationResult = {
        isValid: true,
        invalidReasons: []
      };
      
      // 1. Check for consecutive day scheduling (except Saturday)
      const isSaturday = currentDay.date.getDay() === 6; // 6 is Saturday in JavaScript
      if (!isSaturday && previousDay) {
        const wasScheduledYesterday = Object.values(previousDay.assignments).some(
          intern => intern && intern.id === assignedIntern.id
        );
        
        if (wasScheduledYesterday) {
          stationResult.isValid = false;
          stationResult.invalidReasons.push("Intern scheduled on consecutive days");
        }
      }
      
      // 2. Check Junior-Senior constraints
      // Get the intern's role at this station
      const internRole = stationRoles?.find(
        role => role.internId === assignedIntern.id && role.stationNum === stationNum
      );
      
      if (!internRole) {
        // Intern doesn't have a role defined for this station
        stationResult.isValid = false;
        stationResult.invalidReasons.push("Intern not authorized for this station");
      } else if (internRole.role === 1) {
        // This is a junior who needs backup
        // Find all valid senior stations from constraints
        const validSeniorStations = jsConstraints
          ?.filter(constraint => constraint.juniorStation === stationNum)
          .map(constraint => constraint.seniorStation) || [];
        
        // Check if any senior is scheduled at one of the valid stations
        let hasSeniorBackup = false;
        
        for (const seniorStationNum of validSeniorStations) {
          const seniorIntern = currentDay.assignments[seniorStationNum];
          
          if (seniorIntern) {
            // Check if this intern is actually a senior for the junior's station
            const isSenior = stationRoles?.some(
              role => 
                role.internId === seniorIntern.id && 
                role.stationNum === stationNum && 
                role.role === 2
            );
            
            if (isSenior) {
              hasSeniorBackup = true;
              break;
            }
          }
        }
        
        if (!hasSeniorBackup && validSeniorStations.length > 0) {
          stationResult.isValid = false;
          stationResult.invalidReasons.push("Junior requires senior backup");
        }
      }
      
      // Store the result for this station
      result.stationResults[stationNum] = stationResult;
      
      // Update overall validity
      if (!stationResult.isValid) {
        result.isValid = false;
      }
    }
    
    return result;
  };
  
  // Close dropdown when changing month
  useEffect(() => {
    setActiveDropdown(null);
    setReferenceElement(null);
    setSearchTerm('');
  }, [currentDate]);
  
  // Navigation functions
  const changeMonth = (delta: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };
  
  // Format date as DD/MM
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };
  
  // Get day name
  const getDayName = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };
  
  // Toggle dropdown for assigning interns
  const toggleDropdown = (dayIndex: number, stationNum: number, event: React.MouseEvent) => {
    if (userRole !== 'Manager') return;
  
    const cell = event.currentTarget as HTMLElement;
  
    if (
      activeDropdown &&
      activeDropdown.dayIndex === dayIndex &&
      activeDropdown.stationNum === stationNum
    ) {
      setActiveDropdown(null);
      setReferenceElement(null);
      setSearchTerm('');
    } else {
      if (activeDropdown) {
        setActiveDropdown(null);
        setReferenceElement(null);
  
        setTimeout(() => {
          setActiveDropdown({ dayIndex, stationNum });
          setReferenceElement(cell);
          setSearchTerm('');
        }, 10);
      } else {
        setActiveDropdown({ dayIndex, stationNum });
        setReferenceElement(cell);
        setSearchTerm('');
      }
    }
  };
  
  // Handle intern selection from dropdown
  const handleInternSelect = (intern: Intern | null) => {
    if (activeDropdown) {
      assignIntern(activeDropdown.dayIndex, activeDropdown.stationNum, intern);
    }
  };
  
  // Close the dropdown
  const handleCloseDropdown = () => {
    setActiveDropdown(null);
    setReferenceElement(null);
    setSearchTerm('');
  };
  
  // Assign an intern to a specific day and station
  const assignIntern = (dayIndex: number, stationNum: number, intern: Intern | null) => {
    if (userRole !== 'Manager') return;
    const day = calendarDays[dayIndex];
    if (!day) return;
    
    // Update calendar days immediately for visual feedback
    setCalendarDays(prevDays => {
      const updatedDays = [...prevDays];
      if (!updatedDays[dayIndex].assignments) {
        updatedDays[dayIndex].assignments = {};
      }
      updatedDays[dayIndex].assignments[stationNum] = intern;
      return updatedDays;
    });
    
    if (intern) {
      const newShift = createFauxShift(intern.id, day.date, stationNum);
      
      setPendingChanges(prevChanges => {
        // Check if we already have a pending shift for this date and station
        const existingIndex = prevChanges.findIndex(shift => 
          isSameDay(new Date(shift.shiftDate), day.date) && 
          shift.stationNum === stationNum
        );
        
        if (existingIndex >= 0) {
          // Replace the existing shift
          const newPendingChanges = [...prevChanges];
          newPendingChanges[existingIndex] = newShift;
          return newPendingChanges;
        } else {
          // Add a new shift
          return [...prevChanges, newShift];
        }
      });
    } else {
      // If intern is null (unassigning), remove any pending shift for this date and station
      setPendingChanges(prevChanges => prevChanges.filter(shift => 
        !(isSameDay(new Date(shift.shiftDate), day.date) && shift.stationNum === stationNum)
      ));
    }
    
    // Close dropdown after selection
    setActiveDropdown(null);
    setReferenceElement(null);
    setSearchTerm('');
  };
  
  // Helper function to compare dates (ignoring time)
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };
  
  // Save pending changes to the server
  const saveShiftAndUpdateData = async () => {
    if (pendingChanges.length === 0) return;
    
    setIsSaving(true);
    
    try {
      const savedShifts: Shift[] = [];
      
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
      
      // Update local shifts array
      setAllShifts(prevShifts => {
        const newShifts = [...prevShifts];
        
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
      
      // Clear pending changes
      setPendingChanges([]);
    } catch (err) {
      console.error('Error saving shifts:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Check if a day/station has a pending change
  const hasPendingChange = (dayIndex: number, stationNum: number) => {
    const day = calendarDays[dayIndex];
    if (!day) return false;
    
    return pendingChanges.some(shift => 
      isSameDay(new Date(shift.shiftDate), day.date) && 
      shift.stationNum === stationNum
    );
  };
  
  // Get the cell class name based on state and validation
  const getCellClassName = (dayIndex: number, stationNum: number) => {
    const day = calendarDays[dayIndex];
    if (!day) return "station-cell";
    
    const assignedIntern = day.assignments[stationNum];
    const isPending = hasPendingChange(dayIndex, stationNum);
    
    // Get validation result for this cell if available
    const validationResult = validationResults[dayIndex]?.stationResults[stationNum];
    const isInvalid = validationResult && !validationResult.isValid;
    
    let className = "station-cell";
    
    if (assignedIntern) {
      className += isPending ? " pending-shift" : " existing-shift";
    }
    
    if (isInvalid) {
      className += " invalid-shift";
    }
    
    return className;
  };
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button 
          className="nav-button"
          onClick={() => changeMonth(-1)}>
          Previous Month
        </button>

        <h2 className="month-title">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>

        <button 
          className="nav-button"
          onClick={() => changeMonth(1)}>
          Next Month
        </button>
      </div>
      
      <div className="table-container" ref={tableContainerRef}>
        <table className="calendar-table">
          <thead>
            <tr>
              <th className="date-cell">Date</th>
              <th className="day-name-cell">Day</th>
              {allStations.map(station => (
                <th key={station.stationNum}>
                  {station.stationName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarDays.map((day, dayIndex) => (
              <tr key={dayIndex} className={day.isWeekend ? 'weekend-row' : ''}>
                <td className="date-cell">{formatDate(day.date)}</td>
                <td className="day-name-cell">{getDayName(day.date)}</td>
                {allStations.map(station => {
                  const assignedIntern = day.assignments[station.stationNum];
                  
                  return (
                    <td 
                      key={station.stationNum}
                      className={getCellClassName(dayIndex, station.stationNum)}
                      onClick={(e) => toggleDropdown(dayIndex, station.stationNum, e)}
                      data-day={dayIndex}
                      data-station={station.stationNum}
                    >
                      {assignedIntern ? (
                        <div className="intern-name">
                          {assignedIntern.firstName} {assignedIntern.lastName}
                        </div>
                      ) : (
                        <div className="empty-cell">Click to assign</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Render the dropdown with constrained position */}
      <InternDropdown 
        isOpen={activeDropdown !== null}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClose={handleCloseDropdown}
        onSelect={handleInternSelect}
        interns={allInterns}
        referenceElement={referenceElement}
        tableContainerRef={tableContainerRef}
      />
      
      <div className="save-button-container">
        <button 
          className="save-button"
          disabled={pendingChanges.length === 0 || isSaving}
          onClick={saveShiftAndUpdateData}
        >
          {isSaving ? 'Saving...' : `Save Changes (${pendingChanges.length})`}
        </button>
      </div>
    </div>
  );
}

export default Calendar;