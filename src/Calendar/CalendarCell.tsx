import React from 'react';
import { Intern } from '../API_Services/Models.tsx';
import './Calendar.css'

interface CalendarCellProps {
  dayIndex: number;
  stationNum: number;
  assignedIntern: Intern | null;
  isPending: boolean;
  isModified: boolean;
  isInvalid: boolean;
  userRole: string;
  onCellClick: (dayIndex: number, stationNum: number, event: React.MouseEvent) => void;
  onRevertCell: (dayIndex: number, stationNum:number) => void;
}

function CalendarCell({ 
  dayIndex,
  stationNum,
  assignedIntern,
  isPending,
  isModified,
  isInvalid,
  userRole,
  onCellClick,
  onRevertCell
}: CalendarCellProps) {
  // Determine the CSS class name based on cell status
  const getCellClassName = () => {
    let className = "station-cell";
    
    if (assignedIntern) {
      className += isPending ? " pending-shift" : " existing-shift";
    }

    if (isModified) {
      className += "modified-cell";
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

  const handleRevert = (event: React.MouseEvent) => {
    event.stopPropagation(); //prevent triggering cell click on parent elements (for example, it should prevent the intern dropdown list from showing)
    onRevertCell(dayIndex, stationNum);
  }

  return (
    <td 
      className={getCellClassName()}
      onClick={handleClick}
      data-day={dayIndex}
      data-station={stationNum}
    >
      <div className="cell-content">
        {assignedIntern ? (
          <div className="intern-name">
            {assignedIntern.firstName} {assignedIntern.lastName}
          </div>
        ) : (
          <div className="empty-cell">Click to assign</div>
        )}
        {isModified && userRole === 'Manager' && (
          <button 
            className="revert-button"
            onClick={handleRevert}
            title="Revert changes"
          >
            ↺
          </button>
        )}
      </div>
    </td>
  );
}

export default CalendarCell;