import React, { useState} from 'react';
import './AddUser.css';
import loginService from './API_Services/loginService.tsx';
import { register } from './API_Services/authService.tsx';
import internService from './API_Services/internService.tsx';

function AddUser() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [status, setStatus] = useState<string>("intern");

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
      .then(data => {
        const internId = data.id;
  
        register(userName, password, internId, status)
          .then(() => {
            alert("Registered new Intern");
            setFirstName("");
            setLastName("");
            setUserName("");
            setPassword("");
            setDepartment("");
            setStatus("Intern");
          })
          .catch(error => {
            console.error("User registration failed:", error);
            alert("User registration failed");
          });
  
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
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}

export default AddUser;
