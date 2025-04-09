import React, { useState, useContext } from 'react';
import './AddUser.css';
import { AppContext } from './AppContext';
import { Intern, createIntern } from './API_Services/Models.tsx';
import loginService from './API_Services/loginService.tsx';
import internService from './API_Services/InternService.tsx';
import bcrypt from 'bcryptjs'; // Import bcryptjs

function AddUser() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [status, setStatus] = useState<number>(0);
  const context = useContext(AppContext);
  const [intern, setIntern] = useState<Intern>();

  if (!context) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }

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

    // Hash the password before sending to the backend
    const hashedPassword = bcrypt.hashSync(password, 10); // Hashing the password

    internService.addIntern(firstName, lastName, department)
      .then(data => {
        setIntern(data); // Keep this if you're using intern elsewhere

        // Send hashed password to the backend
        loginService.addLogin({
          username: userName,
          userPassword: hashedPassword, // Store hashed password
          id: data.id,
          status: status
        });

        alert("Registered new Intern");
      })
      .catch(error => {
        console.log("Database did not return an intern object, intern creation likely unsuccessful.");
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
        type="password" // Changed to "password" input type for security
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
      <select id="status" onChange={(e) => setStatus(parseInt(e.target.value))}>
        <option value={0}>Intern</option>
        <option value={1}>Manager</option>
      </select>
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}

export default AddUser;
