import React from 'react';
import { Intern } from '../API_Services/Models.tsx';
import './Calendar.css'

interface CalendarCellProps {
  dayIndex: number;
  stationNum: number;
  assignedIntern: Intern | null;
  isPending: boolean;
  isInvalid: boolean;
  userRole: string;
  onCellClick: (dayIndex: number, stationNum: number, event: React.MouseEvent) => void;
}

function CalendarCell({ 
  dayIndex,
  stationNum,
  assignedIntern,
  isPending,
  isInvalid,
  userRole,
  onCellClick
}: CalendarCellProps) {
  // Determine the CSS class name based on cell status
  const getCellClassName = () => {
    let className = "station-cell";
    
    if (assignedIntern) {
      className += isPending ? " pending-shift" : " existing-shift";
    }
    
    if (isInvalid) {
      className += " invalid-shift";
    }
    
    return className;
  };

  // Only allow managers to click on cells
  const handleClick = (event: React.MouseEvent) => {
    if (userRole === 'Manager') {
      onCellClick(dayIndex, stationNum, event);
    }
  };

  return (
    <td 
      className={getCellClassName()}
      onClick={handleClick}
      data-day={dayIndex}
      data-station={stationNum}
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
}

export default CalendarCell;