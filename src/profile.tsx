import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

import shiftService from './API_Services/shiftService.tsx';
import { Shift} from './API_Services/Models.tsx';

interface JwtPayload {
  internId: string;
  role: string;
  exp: number;
}

const Profile: React.FC = () => {
  const [myShifts, setMyShifts] = useState<Shift[]>([]);

  useEffect(() => {
    const fetchShifts = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded: JwtPayload = jwtDecode(token);
        const internId = parseInt(decoded.internId);

        const shifts = await shiftService.getShiftsByInternId(internId);

        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

        const upcomingShifts = shifts.filter((shift) => {
            const shiftDate = new Date(shift.shiftDate);
            return shiftDate >= now && shiftDate <= oneMonthLater;
        });
        setMyShifts(upcomingShifts);
    };

    fetchShifts();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Shifts (Next 30 Days)</h2>
      {myShifts.length === 0 ? (
        <p>No upcoming shifts scheduled.</p>
      ) : (
        <ul className="space-y-2">
          {myShifts.map((shift) => (
            <li key={shift.id} className="border p-2 rounded shadow-sm">
              <div><strong>Date:</strong> {new Date(shift.shiftDate).toLocaleDateString()}</div>
              {/* Add any other shift info you'd like to show */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profile;