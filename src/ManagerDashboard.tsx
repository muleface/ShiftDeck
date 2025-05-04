import React, { useEffect, useState } from "react";
import getShiftStats from './API_Services/shiftService.tsx';

interface ShiftStats {
  internId: number;
  internName: string;
  totalShifts: number;
  weekendShifts: number;
}

const ManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<ShiftStats[]>([]);

  useEffect(() => {
    getShiftStats.getShiftStats().then(res => {
      setStats(res.data);
    }).catch(err => {
      console.error("Failed to fetch shift stats:", err);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Intern Shift Stats</h2>
      <table className="min-w-full border-collapse border">
        <thead>
          <tr>
            <th>Intern</th>
            <th>Total Shifts</th>
            <th>Weekend Shifts</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(stat => (
            <tr key={stat.internId}>
              <td>{stat.internName}</td>
              <td>{stat.totalShifts}</td>
              <td>{stat.weekendShifts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerDashboard;
