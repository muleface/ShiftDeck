import React, { useState, useEffect, useContext } from 'react';
import './AddUser.css';
import { AppContext } from './AppContext';
import {Intern,createIntern} from './API_Services/Models.tsx';
import loginService from './API_Services/loginService.tsx';
import internService from './API_Services/internService.tsx';

function AddUser(){
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [id, setid] = useState<(number)>(28);
  const [status, setStatus] = useState<(number)>(0);
  const context = useContext(AppContext);
  const [intern, setIntern] = useState<Intern>();

  if (!context) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }

  const handleLogin = () => {
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
  
    internService.addIntern(firstName,lastName,department)
    .then(data => {
      setIntern(data);
    })
    .catch(error => {
      console.log("Database did not return an intern object, intern creation likely unsuccessful.");
      return;
    })
    if (!intern) {
      return;
    }
    loginService.addLogin({username:userName,userPassword:password,id:intern.id,status:status});
    setid(i=>i++);
    alert("Registered new Intern");
  };

  return (
    <div className="signup-container">
        <h2>signup</h2>
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
        type="text" 
        placeholder="Choose Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        />
        <input 
        type="text" 
        placeholder="Enter departmetn" 
        value={department} 
        onChange={(e) => setDepartment(e.target.value)}
        />
        <select id="status" 
        onChange={(e) => setStatus(parseInt(e.target.value))}>
            <option value={0}>Intern</option>
            <option value={1}>Manager</option>
        </select>
        <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default AddUser;