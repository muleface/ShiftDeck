import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import './Calendar.css';
import { AppContext } from '../AppContext';
import { Intern, Shift, createFauxShift, fauxShift } from '../API_Services/Models';
import InternDropdown from './InternDropdown';
import CalendarHeader from './CalendarHeader';
import CalendarTable from './CalendarTable';
import { createShiftManager } from './ShiftManager';

interface CalendarDay {
  date: Date;
  assignments: { [stationNum: number]: Intern | null };
  isWeekend: boolean;
}

function Calendar() {
  // State management
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // For tracking pending changes updates to trigger re-renders
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);
  
  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState<{
    dayIndex: number, 
    stationNum: number
  } | null>(null);
  const [dropdownElement, setDropdownElement] = useState<HTMLElement | null>(null);
  
  // Ref for table container
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Get context data
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error("AppContext must be available");
  }
  
  const { allInterns, allStations, stationRoles, jsConstraints, userRole } = context;
  
  // Create ShiftManager instance
  const shiftManager = useMemo(() => {
    return createShiftManager({
      allInterns,
      stationRoles,
      jsConstraints,
      onPendingChangesUpdate: (changes) => {
        // Increment counter to trigger re-render when pendingChanges update
        const deletions = shiftManager ? shiftManager.getPendingDeletions() : [];
        setPendingChangesCount(changes.length + deletions.length);
      },
      allShifts,
      setAllShifts
    });
  }, [allInterns, stationRoles, jsConstraints, allShifts, setAllShifts]);
  
  // Get current pending changes
  const pendingChanges = shiftManager.getPendingChanges();
  const pendingDeletions = shiftManager.getPendingDeletions();

  //Get modified cells for UI highlighting
  const modifiedCellsByDay = useMemo(() => {
    console.log("Recalculating modifiedCellsByDay", pendingChangesCount);
    return shiftManager.getModifiedCells(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
  }, [shiftManager, currentDate, pendingChangesCount]);
  
  // Fetch all shifts on component mount
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        await shiftManager.fetchAllShifts();
      } catch (err) {
        console.error('Error fetching shifts:', err);
      }
    };
    
    fetchShifts();
  }, []);
  
  // Reset dropdown when changing month
  useEffect(() => {
    setActiveDropdown(null);
    setDropdownElement(null);
  }, [currentDate]);
  
  // Close dropdown when table is scrolled
  useEffect(() => {
    if (activeDropdown && tableContainerRef.current) {
      const handleScroll = () => {
        handleCloseDropdown();
      };
      
      tableContainerRef.current.addEventListener('scroll', handleScroll);
      
      return () => {
        if (tableContainerRef.current) {
          tableContainerRef.current.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [activeDropdown]);
  
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
  
  // Apply existing shifts from the server
  if (allShifts.length > 0) {
    allShifts.forEach(shift => {
      const shiftDate = new Date(shift.shiftDate);
      // Check if this shift belongs to the current month
      if (shiftDate.getMonth() === month && shiftDate.getFullYear() === year) {
        const dayIndex = shiftDate.getDate() - 1; // Days are 1-indexed but array is 0-indexed
        if (days[dayIndex]) {
          const assignedIntern = allInterns.find(intern => intern.id === shift.internId);
          if (assignedIntern) {
            days[dayIndex].assignments[shift.stationNum] = assignedIntern;
          }
        }
      }
    });
  }
  
  // Apply pending changes
  const currentPendingChanges = shiftManager.getPendingChanges();
  currentPendingChanges.forEach(pendingShift => {
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
}, [currentDate, allShifts, allInterns, pendingChangesCount, shiftManager]); 
  
  // Navigation functions
  const handleChangeMonth = (delta: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };
  
  // Toggle dropdown for assigning interns
  const handleCellClick = (dayIndex: number, stationNum: number, event: React.MouseEvent) => {
    if (userRole !== 'Manager') return;
  
    const cell = event.currentTarget as HTMLElement;
  
    if (
      activeDropdown &&
      activeDropdown.dayIndex === dayIndex &&
      activeDropdown.stationNum === stationNum
    ) {
      setActiveDropdown(null);
      setDropdownElement(null);
    } else {
      if (activeDropdown) {
        setActiveDropdown(null);
        setDropdownElement(null);
  
        setTimeout(() => {
          setActiveDropdown({ dayIndex, stationNum });
          setDropdownElement(cell);
        }, 10);
      } else {
        setActiveDropdown({ dayIndex, stationNum });
        setDropdownElement(cell);
      }
    }
  };
  
  // Handle intern selection from dropdown
  const handleInternSelect = (intern: Intern | null, dayIndex: number, stationNum: number) => {
    const day = calendarDays[dayIndex];
    if (!day) return;
    
    if (intern) {
      const newShift = createFauxShift(intern.id, day.date, stationNum);
      shiftManager.addPendingShift(newShift);
    } else {
      // Remove from pending changes if unassigning
      shiftManager.removePendingShift({ 
        shiftDate: day.date, 
        stationNum 
      });
    }
    
    // Close dropdown after selection
    setActiveDropdown(null);
    setDropdownElement(null);
  };
  
  // Close the dropdown
  const handleCloseDropdown = () => {
    setActiveDropdown(null);
    setDropdownElement(null);
  };
  
  // Validate the calendar
  const validateCalendar = () => {
    const validationResults: { [dayIndex: number]: { [stationNum: number]: boolean } } = {};
    
    calendarDays.forEach((day, dayIndex) => {
      const previousDay = dayIndex > 0 ? calendarDays[dayIndex - 1] : null;
      validationResults[dayIndex] = shiftManager.validateDay(day, previousDay);
    });
    
    return validationResults;
  };
  
  // Get validation results for the calendar
  const validationResults = useMemo(() => {
    return validateCalendar();
  }, [calendarDays, pendingChangesCount]);
  
  // Transform pending changes to the format needed by child components
  const pendingChangesByDay = useMemo(() => {
    return shiftManager.transformPendingChangesToMap(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
  }, [shiftManager, currentDate, pendingChangesCount]);

  // Handle reverting a cell modification
  const handleRevertCell = (dayIndex: number, stationNum: number) => {
    const day = calendarDays[dayIndex];
    if (!day) return;
    
    shiftManager.revertCellModification(day.date, stationNum);
  };
  
  // Save pending changes to the server
  const saveShiftAndUpdateData = async () => {
    if (pendingChanges.length === 0 && pendingDeletions.length === 0) return;
    
    setIsSaving(true);
    
    try {
      await shiftManager.saveShifts();
    } catch (err) {
      console.error('Error saving shifts:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="calendar-container">
      <CalendarHeader 
        currentDate={currentDate}
        onChangeMonth={handleChangeMonth}
      />
      
      <div className="table-container" ref={tableContainerRef}>
        <CalendarTable
          calendarDays={calendarDays}
          allStations={allStations}
          pendingChanges={pendingChangesByDay}
          modifiedCells = {modifiedCellsByDay}
          validationResults={validationResults}
          userRole={userRole}
          onCellClick={handleCellClick}
          onRevertCell = {handleRevertCell}
        />
      </div>
      
      {/* Intern selection dropdown */}
      <InternDropdown 
        targetInfo={activeDropdown}
        targetElement={dropdownElement}
        onClose={handleCloseDropdown}
        onSelect={handleInternSelect}
        interns={allInterns}
      />
      
      <div className="save-button-container">
        <button 
          className="save-button"
          disabled={pendingChangesCount === 0 || isSaving}
          onClick={saveShiftAndUpdateData}
        >
          {isSaving ? 'Saving...' : `Save Changes (${pendingChangesCount})`}
        </button>
      </div>
    </div>
  );
}

export default Calendar;