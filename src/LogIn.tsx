import { useState, useContext } from 'react';
import './LogIn.css';
import { AppContext } from "./AppContext";
import loginService from './API_Services/loginService.tsx';
import internService from './API_Services/InternService.tsx';
import { login } from './API_Services/authService.tsx';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

interface JwtPayload {
  internId: number;
  sub: string; // username
  exp: number;
  id: string; // ASP.NET Identity user ID
  }
function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const userContext = useContext(AppContext);

  if (!userContext) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }

  const { setUser,setStatus } = userContext;

  const handleLogin = () => {
    if (username.trim() !== "" && password.trim() !== "") {
      
      login(username, password)
  .then(token => {
    const decoded: any = jwtDecode(token);
    const internId = parseInt(decoded.internId);

    if (!internId) {
      alert("Login failed: Intern ID missing in token");
      return;
    }

    internService.getInternById(internId)
      .then(intern => {
        setUser(intern);
      });

    localStorage.setItem("token", token);
  })
        .catch(error => {
          if (axios.isAxiosError(error)) {
            console.error("Login failed:", error.response?.data || error.message);
          } else {
            console.error("Unexpected error:", error);
          }
          alert("Invalid username or password.");
        });
    } else {
      alert("Please enter a valid username and password");
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
