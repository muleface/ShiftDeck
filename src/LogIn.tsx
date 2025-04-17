import { useState, useContext } from 'react';
import './LogIn.css';
import { AppContext } from "./AppContext";
import internService from './API_Services/internService.tsx';
import { login } from './API_Services/authService.tsx';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

interface JwtPayload {
  internId: number;
  sub: string; // username
  exp: number;
  id: string; // ASP.NET Identity user ID
  role: string; // "Intern" or "Manager"
}
function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const userContext = useContext(AppContext);

  if (!userContext) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }

  const { setUser,setUserRole } = userContext;

  const handleLogin = async () => {
    if (username.trim() === "" || password.trim() === "") {
      alert("Please enter a valid username and password");
      return;
    }
  
    try {
      // 1. Login and get the token
      const token = await login(username, password);
      
      // 2. Save token to localStorage for future authenticated requests
      localStorage.setItem("token", token);
  
      // 3. Decode the token to extract user info (like internId)

      const decoded: JwtPayload = jwtDecode(token);
      const internId = parseInt(decoded.internId.toString());
  
      if (!internId || !decoded.role) {
        alert("Login failed: missing intern ID or role in token");
        return;
      }
  
      // 4. Fetch intern info from backend using internId
      const intern = await internService.getInternById(internId);
      setUser(intern); // save the logged-in user's info (likely to context or state)

      setUserRole(decoded.role);
      
      // Optional: redirect or navigate to a protected page after login
      // navigate('/dashboard'); <-- if using React Router
  
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Login failed:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      alert("Invalid username or password.");
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
