import { useEffect, useState, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import shiftService from './API_Services/shiftService.tsx';
import stationService from './API_Services/stationService.tsx'; // Import stationService
import { Shift } from './API_Services/Models.tsx';
import { AppContext } from "./AppContext";
import './Profile.css';

interface JwtPayload {
  internId: string;
  role: string;
  exp: number;
}

const Profile: React.FC = () => {
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [stationNames, setStationNames] = useState<Record<number, string>>({}); // Map to store station names
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }

  const { searchedUser } = context;

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

      // Sort shifts by date (closest date first)
      const sortedShifts = upcomingShifts.sort((a, b) => {
        const dateA = new Date(a.shiftDate);
        const dateB = new Date(b.shiftDate);
        return dateA.getTime() - dateB.getTime(); // Sort in ascending order
      });

      setMyShifts(sortedShifts);

      // Fetch station names for the shifts using stationService
      const nameMap: Record<number, string> = {};
      for (const shift of sortedShifts) {
        const station = await stationService.getStationByNum(shift.stationNum); // Use stationService
        nameMap[shift.stationNum] = station.stationName;
      }
      setStationNames(nameMap);
    };

    fetchShifts();
  }, [searchedUser]);

  return (
    <div className="profile-container">
      <h2>My Shifts (Next 30 Days)</h2>
      {myShifts.length === 0 ? (
        <p>No upcoming shifts scheduled.</p>
      ) : (
        <table className="shifts-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Station</th>
            </tr>
          </thead>
          <tbody>
            {myShifts.map((shift) => {
              const stationName = stationNames[shift.stationNum] || `Station ${shift.stationNum}`;
              return (
                <tr key={shift.id}>
                  <td>{new Date(shift.shiftDate).toLocaleDateString()}</td>
                  <td>{stationName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Profile;
