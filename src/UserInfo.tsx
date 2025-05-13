import { useState, useEffect, useContext } from 'react';
import internService from './API_Services/internService.tsx';
import {Intern} from './API_Services/Models.tsx';
import "./UserInfo.css";
import { AppContext } from "./AppContext";
import stationRoleService from './API_Services/stationRoleService.tsx';
import stationService from './API_Services/stationService.tsx';
import { StationRole } from './API_Services/Models.tsx';
import { promoteToManager } from './API_Services/authService.tsx'; // assumes this file includes the function


function UserInfo() {
  const [intern, setIntern] = useState<Intern>();
  const context = useContext(AppContext);
  const [roles, setRoles] = useState<StationRole[]>([]);
  const [stationNames, setStationNames] = useState<Record<number, string>>({});


  if (!context) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }

  const {searchedUser} = context;
  useEffect(() => {
    if (searchedUser !== 0) {
      internService.getInternById(searchedUser)
        .then(data => setIntern(data))
        .catch(err => console.error('Error intern:', err));
  
      stationRoleService.getRolesByInternId(searchedUser)
        .then(async (roleData) => {
          setRoles(roleData);
  
          // Fetch all station names
          const nameMap: Record<number, string> = {};
          for (const role of roleData) {
            const station = await stationService.getStationByNum(role.stationNum);
            nameMap[role.stationNum] = station.stationName;
          }
          setStationNames(nameMap);
        })
        .catch(err => console.error('Error roles:', err));
    }
  }, [searchedUser]);


  const handlePromote = async (intern: Intern) => {
    
      const confirm = window.confirm(`Are you sure you want to promote ${intern.firstName} ${intern.lastName} to manager?`);
      if (!confirm) return;
    
      try {
        await promoteToManager(intern.id);
        alert(`${intern.firstName} ${intern.lastName} has been promoted to manager.`);
      } catch (error) {
        console.error("Failed to promote:", error);
        alert("Failed to promote intern.");
      }
    };

  if(searchedUser===0)
  {
    return(
    <p>you have to choose an intern first</p>
    );
  }
  return (
    <div className="info">
      <h2>Intern Info</h2>
      <p>FIrst Name: {intern?.firstName}</p>
      <p>Last Name: {intern?.lastName}</p>
      <p>Department: {intern?.department}</p>
      <h3>Station Roles</h3>
      <table className="role-table">
        <thead>
          <tr>
            <th>Station</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => {
            const roleLabel = role.role === 0 ? "No Role" : role.role === 1 ? "Junior" : "Senior";
            const canPromote = role.role < 2;

            return (
              <tr key={role.stationNum}>
                <td>{stationNames[role.stationNum] ?? role.stationNum}</td>
                <td>{roleLabel}</td>
                <td>
                  <button
                    disabled={!canPromote}
                    onClick={async () => {
                      const nextRole = role.role + 1;
                      const stationName = stationNames[role.stationNum] ?? `Station ${role.stationNum}`;
                      const confirm = window.confirm(`Are you sure you want to promote ${intern?.firstName} to ${nextRole === 1 ? 'Junior' : 'Senior'} at ${stationName}?`);
                      if (!confirm) return;

                      try {
                        await stationRoleService.changeStationRole(role.stationNum, role.internId, nextRole);
                        setRoles(prev =>
                          prev.map(r =>
                            r.stationNum === role.stationNum ? { ...r, role: nextRole } : r
                          )
                        );
                        alert("Promotion successful.");
                      } catch (err) {
                        console.error("Failed to promote:", err);
                        alert("Failed to promote role.");
                      }
                    }}
                    className={`px-2 py-1 rounded ${canPromote ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                  >
                    Promote
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button
          onClick={() => {
            if (intern) {
              handlePromote(intern);
            } else {
              console.error("No intern data available.");
            }
          }}
        >
          PROMOTE TO MANAGER
      </button>
    </div>
    
  ); 
    
}

export default UserInfo;
