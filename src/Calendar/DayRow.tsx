import React from 'react';
import CalendarCell from './CalendarCell.tsx';
import { Intern, Station } from '../API_Services/Models.tsx';
import './Calendar.css';

interface DayRowProps {
  date: Date;
  dayIndex: number;
  isWeekend: boolean;
  stations: Station[];
  assignments: { [stationNum:number]: Intern | null };
  pendingChanges: { [stationNum:number]:boolean };
  modifiedCells: { [stationNum:number]:boolean};
  invalidStations: { [stationNum:number]:boolean };
  userRole: string;
  onCellClick: (dayIndex: number, stationNum: number, event: React.MouseEvent) => void;
  onRevertCell: (dayIndex:number, stationNum:number) => void;
}

function DayRow({
  date,
  dayIndex,
  isWeekend,
  stations,
  assignments,
  pendingChanges,
  modifiedCells,
  invalidStations,
  userRole,
  onCellClick,
  onRevertCell
}: DayRowProps) {
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

  return (
    <tr className={isWeekend ? 'weekend-row' : ''}>
      <td className="date-cell">{formatDate(date)}</td>
      <td className="day-name-cell">{getDayName(date)}</td>
      
      {stations.map(station => (
        <CalendarCell
          key={station.stationNum}
          dayIndex={dayIndex}
          stationNum={station.stationNum}
          assignedIntern={assignments[station.stationNum] || null}
          isPending={pendingChanges[station.stationNum] || false}
          isModified= {modifiedCells[station.stationNum] || false}
          isInvalid={invalidStations[station.stationNum] || false}
          userRole={userRole}
          onCellClick={onCellClick}
          onRevertCell={onRevertCell}
        />
      ))}
    </tr>
  );
}

export default DayRow;