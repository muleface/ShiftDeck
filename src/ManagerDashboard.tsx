import React, { useEffect, useState } from "react";
import shiftService from './API_Services/shiftService.tsx';
import { promoteToManager } from './API_Services/authService.tsx'; // assumes this file includes the function

export interface ShiftStats {
  internId: number;
  internName: string;
  userId: string | null;
  totalShifts: number;
  weekendShifts: number;
}

const ManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<ShiftStats[]>([]);

  useEffect(() => {
    shiftService.getShiftStats().then(res => {
      console.log("Fetched stats:", res);  // should now be a typed array
      setStats(res);
    });
  }, []);

  const handlePromote = async (intern: ShiftStats) => {
    if (!intern.userId) {
      alert("Cannot promote: no user account linked.");
      return;
    }
  
    const confirm = window.confirm(`Are you sure you want to promote ${intern.internName} to manager?`);
    if (!confirm) return;
  
    try {
      await promoteToManager(intern.userId);
      alert(`${intern.internName} has been promoted to manager.`);
    } catch (error) {
      console.error("Failed to promote:", error);
      alert("Failed to promote intern.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Intern Shift Stats</h2>
      <table className="min-w-full border-collapse border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Intern</th>
            <th className="border px-4 py-2">Total Shifts</th>
            <th className="border px-4 py-2">Weekend Shifts</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(stats || []).filter(intern => intern.userId).map(intern => (
            <tr key={intern.internId}>
              <td className="border px-4 py-2">{intern.internName}</td>
              <td className="border px-4 py-2">{intern.totalShifts}</td>
              <td className="border px-4 py-2">{intern.weekendShifts}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handlePromote(intern)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                >
                  Promote
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerDashboard;