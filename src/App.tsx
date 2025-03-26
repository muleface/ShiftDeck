import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import LogIn from "./LogIn.tsx";
import SearchIntern from "./SearchIntern.tsx";
import Menu from "./Menu.tsx";
import Calendar from "./Calendar.tsx";
import HomePage from "./HomePage.tsx";
import UserInfo from "./UserInfo.tsx";
import {AppProvider, AppContext} from './AppContext.tsx'

function App () {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

function AppContent() {
    const context = useContext(AppContext);
    if (!context)
      throw new Error("Fatal error - context failed to load.");

    const { isLogged, setIsLogged,
      user, setUser,
      menuExpanded, setMenuExpanded,
      searchedUser, setSearchedUser, 
      allInterns, setAllInterns, 
      allStations, setAllStations } = context;
      
  return (
    <>
    {isLogged ? (
          <Router>
          <Menu setMenuExpanded={setMenuExpanded} />
          <div className="page-content">
            <Header />
            <Routes>
              <Route path="/" element={<Calendar />} />
              <Route path="/user" element={<UserInfo />} />
            </Routes>
            <Footer />
          </div>
          </Router>
      ) : (
          <LogIn />
      )}
  </>
  );
}

export default App;
