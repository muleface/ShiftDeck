import React, { useState, useEffect} from 'react';
import './AddUser.css';
import { register } from './API_Services/authService.tsx';
import internService from './API_Services/internService.tsx';
import stationService from './API_Services/stationService.tsx';
import stationRoleService from './API_Services/stationRoleService.tsx';
import addStationRole from './API_Services/stationRoleService.tsx';
import { Station, StationRole } from './API_Services/Models.tsx';




function AddUser() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [status, setStatus] = useState<string>("intern");
  const [stations, setStations] = useState<Station[]>([]);
  const [stationRoles, setStationRoles] = useState<Record<number, number>>({});

  useEffect(() => {
    stationService.getAllStations().then(data => setStations(data));
  }, []);

  const handleSignup = () => {
    const nameRegex = /^[A-Za-z]+$/;
  
    if (userName.trim() === "" || password.trim() === "") {
      alert("Username and password cannot be empty");
      return;
    }
  
    if (!nameRegex.test(firstName)) {
      alert("First name must only contain letters");
      return;
    }
  
    if (!nameRegex.test(lastName)) {
      alert("Last name must only contain letters");
      return;
    }
  
    internService.addIntern(firstName, lastName, department)
    .then(async data => {
      const internId = data.id;

      try {
        await register(userName, password, internId, status);

        for (const station of stations) {
          const selectedRole = stationRoles[station.stationNum] ?? 0;
          await stationRoleService.addStationRole(station.stationNum, internId, selectedRole);
        }

        alert("Registered new Intern and assigned selected roles.");

        // Reset form
        setFirstName("");
        setLastName("");
        setUserName("");
        setPassword("");
        setDepartment("");
        setStatus("Intern");
        setStationRoles({});  // 👈 reset all selectors to 0

      } catch (error) {
        console.error("User registration or role assignment failed:", error);
        alert("Registration or role assignment failed.");
      }
    })
    .catch(error => {
      console.error("Intern creation failed:", error);
      alert("Intern creation failed");
    });
  };


  
  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <input 
        type="text" 
        placeholder="Choose first name" 
        value={firstName} 
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="Choose last name" 
        value={lastName} 
        onChange={(e) => setLastName(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="Choose Username" 
        value={userName} 
        onChange={(e) => setUserName(e.target.value)}
      />
      <input 
        type="password"
        placeholder="Choose Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="Enter department" 
        value={department} 
        onChange={(e) => setDepartment(e.target.value)}
      />
      <select id="status" onChange={(e) => setStatus(e.target.value)}>
        <option value="Intern">Intern</option>
        <option value="Manager">Manager</option>
      </select>
      
      {stations.map(station => (
        <div key={station.stationNum}>
          <label>{station.stationName}:</label>
          <select
            value={stationRoles[station.stationNum] ?? 0}
            onChange={e =>
              setStationRoles(prev => ({
                ...prev,
                [station.stationNum]: parseInt(e.target.value)
              }))
            }
          >
            <option value={0}>No Role</option>
            <option value={1}>Junior</option>
            <option value={2}>Senior</option>
          </select>
        </div>
      ))}

      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}

export default AddUser;
