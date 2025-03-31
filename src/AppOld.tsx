import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import LogIn from "./LogIn.tsx";
import SearchIntern from "./SearchIntern.tsx";
import Menu from "./Menu.tsx";
import internService from './API_Services/blablah.tsx';
import {Intern} from './API_Services/Models.tsx';
import Calendar from "./Calendar.tsx";
import HomePage from "./HomePage.tsx";
import UserInfo from "./UserInfo.tsx";

interface UserContextType {
  user: string;
  setUser: React.Dispatch<React.SetStateAction<string>>;
  isLogged: boolean;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
}
interface InternsContextType {
  allInterns: Intern[];
  setAllInterns: React.Dispatch<React.SetStateAction<Intern[]>>;
  searchedUser: number;
  setSearchedUser: React.Dispatch<React.SetStateAction<number>>;
}


export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
export const InternsContext = createContext<InternsContextType | undefined>(
  undefined
);

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState("");
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [allInterns, setAllInterns] = useState<Intern[]>([]);
  const [searchedUser, setSearchedUser] = useState<number>(0);

  useEffect(() => {
    internService.getAllInterns()
      .then(data => {
        setAllInterns(data);
      })
      .catch(err => console.error('Error fetching all interns:', err));
  }, []);

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
        <InternsContext.Provider value={{allInterns, setAllInterns, searchedUser, setSearchedUser }}>
          <Router>
          <Menu setMenuExpanded={setMenuExpanded} />
          <div className="page-content">
            <Header />
            <Routes>
              <Route path="/home" element={<HomePage />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/search" element={<SearchIntern />} />
              <Route path="/user" element={<UserInfo id={searchedUser} />} />
            </Routes>
            <Footer />
          </div>
          </Router>
          </InternsContext.Provider>
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
