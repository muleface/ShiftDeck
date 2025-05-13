import React, { useEffect, useState } from "react";
import shiftService from './API_Services/shiftService.tsx';
import "./ManagerDashboard.css";


export interface ShiftStats {
  internId: number;
  internName: string;
  thisMonthShifts: number; // Update the field names
  thisMonthWeekendShifts: number;
  lastMonthShifts: number;
  lastMonthWeekendShifts: number;
}

const ManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<ShiftStats[]>([]);

  useEffect(() => {
    shiftService.getShiftStats().then(res => {
      console.log("Fetched stats:", res);  // should now be a typed array
      setStats(res);
    });
  }, []);

  return (
    <div className="shifts-stats">
      <h2>Intern Shift Stats</h2>
      <table >
        <thead>
          <tr>
            <th>Intern</th>
            <th>This Month's Total Shifts</th>
            <th>This Month's Weekend Shifts</th>
            <th>Last Month's Total Shifts</th>
            <th>Last Month's Weekend Shifts</th>
          </tr>
        </thead>
        <tbody>
          {(stats || []).map((intern) => (
            <tr key={intern.internId}>
              <td>{intern.internName}</td>
              <td>{intern.thisMonthShifts}</td>
              <td>{intern.thisMonthWeekendShifts}</td>
              <td>{intern.lastMonthShifts}</td>
              <td>{intern.lastMonthWeekendShifts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerDashboard;