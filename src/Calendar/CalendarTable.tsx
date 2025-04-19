import React, { useRef } from 'react';
import DayRow from './DayRow';
import { Intern, Station } from '../API_Services/Models';
import './Calendar.css';

interface CalendarDay {
  date: Date;
  assignments: { [stationNum: number]: Intern | null };
  isWeekend: boolean;
}

interface CalendarTableProps {
  calendarDays: CalendarDay[];
  allStations: Station[];
  pendingChanges: { [dayIndex: number]: { [stationNum: number]: boolean } };
  validationResults: { [dayIndex: number]: { [stationNum: number]: boolean } };
  userRole: string;
  onCellClick: (dayIndex: number, stationNum: number, event: React.MouseEvent) => void;
}

function CalendarTable({
  calendarDays,
  allStations,
  pendingChanges,
  validationResults,
  userRole,
  onCellClick
}: CalendarTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  return (
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
            <DayRow
              key={dayIndex}
              date={day.date}
              dayIndex={dayIndex}
              isWeekend={day.isWeekend}
              stations={allStations}
              assignments={day.assignments}
              pendingChanges={pendingChanges[dayIndex] || {}}
              invalidStations={
                validationResults[dayIndex]
                  ? Object.keys(validationResults[dayIndex]).reduce((acc, stationNum) => {
                      // In our new format, false means invalid
                      acc[parseInt(stationNum)] = !validationResults[dayIndex][parseInt(stationNum)];
                      return acc;
                    }, {} as { [stationNum: number]: boolean })
                  : {}
              }
              userRole={userRole}
              onCellClick={onCellClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CalendarTable;