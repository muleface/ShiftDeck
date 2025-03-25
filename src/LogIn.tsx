import { useState, useContext } from 'react';
import './LogIn.css';
import { AppContext } from "./AppContext";

function LogIn() {
  const [username, setUsername] = useState('');
  const userContext = useContext(AppContext);

  if (!userContext) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }

  const { setUser } = userContext;
  const { setIsLogged } = userContext;
  const { isLogged } = userContext;

  const handleLogin = () => {
    if (username.trim() !== "") {
      setUser(username); // Updates context state
      setIsLogged(!isLogged);
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
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default LogIn;
