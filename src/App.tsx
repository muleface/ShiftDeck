import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import LogIn from "./LogIn.tsx";
import InternTester from "./InternTester.tsx";
import SearchIntern from "./SearchIntern.tsx";
import Menu from "./Menu.tsx";
import Calendar from "./Calendar.tsx";
import HomePage from "./HomePage.tsx";

interface UserContextType {
  user: string;
  setUser: React.Dispatch<React.SetStateAction<string>>;
  isLogged: boolean;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState("");
  const [menuExpanded, setMenuExpanded] = useState(false);

  useEffect(() => {
    const contentElement = document.querySelector(".page-content");
    if (contentElement) {
      if (menuExpanded) {
        contentElement.classList.add("menu-expanded");
        contentElement.classList.remove("menu-closed");
      } else {
        contentElement.classList.add("menu-closed");
        contentElement.classList.remove("menu-expanded");
      }
    }
  }, [menuExpanded]);

  return (
    <>
    {isLogged ? (
        <>
          <Router>
          <Menu setMenuExpanded={setMenuExpanded} />
          <div className="page-content">
            <Header />
            <Routes>
              <Route path="/home" element={<HomePage />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/search" element={<SearchIntern />} />
            </Routes>
            <Footer />
          </div>
          </Router>
        </>
      ) : (
        <UserContext.Provider value={{user, setUser, isLogged, setIsLogged}}>
          <LogIn />
        </UserContext.Provider>
      )}
      
    </>
  );
}

export default App;
