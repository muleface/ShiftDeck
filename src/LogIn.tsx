import { useState, useContext } from 'react';
import './LogIn.css';
import { AppContext } from "./AppContext";
import loginService from './API_Services/loginService.tsx';
import internService from './API_Services/InternService.tsx';
import bcrypt from 'bcryptjs';

function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const userContext = useContext(AppContext);

  if (!userContext) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }

  const { setUser,setStatus } = userContext;

  const handleLogin = () => {
    if (username.trim() !== "" &&password.trim() !== "") {
      
      const hashedPassword = bcrypt.hashSync(password, 10); // Hashing the password

      loginService.login(username, hashedPassword)
      .then(data => {
        if(data){
          internService.getInternById(data.id)
          .then(data2 => {
            setUser(data2);
          })
        .catch(error => {
          console.log("Database did not return an intern object.");
          })
          setStatus(data.status);
        }
      })
      .catch(error => {
        console.log("Database did not return an intern object, there is most like no intern with that name.");
      })
      
    } else {
      alert("Please enter a valid username");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input 
        type="text" 
        placeholder="Enter username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
      />
      <input 
        type="password" 
        placeholder="Enter password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default LogIn;
