import { useState, useContext } from 'react';
import './LogIn.css';
import { UserContext } from "./App";

function signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [id, setId] = useState('');
  const [status, setStatus] = useState('');
  const userContext = useContext(UserContext);

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
    <div className="signup-container">
        <h2>signup</h2>
        <input 
        type="text" 
        placeholder="Choose Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
        />
        <input 
        type="text" 
        placeholder="Choose Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        />
        <input 
        type="number" 
        placeholder="Enter intern ID" 
        value={id} 
        onChange={(e) => setPassword(e.target.value)}
        />
        <select name="cars" id="cars">
            <option value="intern">Volvo</option>
            <option value="manager">Saab</option>
            <option value="admin">Opel</option>
        </select>
        <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default signup;
