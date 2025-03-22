import React, { useState, useEffect, createContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import './App.css'
import Header from './Header.tsx'
import Footer from './Footer.tsx'
import LogIn  from './LogIn.tsx';

interface UserContextType {
  user: string;
  setUser: React.Dispatch<React.SetStateAction<string>>;
  isLogged: boolean;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create context with default value
export const UserContext = createContext<UserContextType | undefined>(undefined);


function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState("");  

  return (
    <>
      {isLogged ? (
        <>
        
          <Header />

          <p>hello {user}</p>
          <Footer />
        </>
      ) : (
        <UserContext.Provider value={{user, setUser, isLogged, setIsLogged}}>
          <LogIn />
        </UserContext.Provider>
      )}
      </>
  );
    
}

export default App
