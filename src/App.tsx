import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import LogIn from "./LogIn.tsx";
import Menu from "./Menu.tsx";
import Calendar from "./Calendar/Calendar.tsx";
import UserInfo from "./UserInfo.tsx";
import {AppProvider, AppContext} from './AppContext.tsx'
import AddUser from "./AddUser.tsx";
import Profile from "./profile.tsx";
import InactivityHandler from "./InactivityHandler";

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

    const {
      
      user, setUser,
      menuExpanded, setMenuExpanded,
      searchedUser, setSearchedUser, 
      allInterns, setAllInterns, 
      allStations, setAllStations, 
    userRole} = context;
      
  return (
    <>
    {(user!=undefined) ? (
          <Router>
          <InactivityHandler />
          <Menu setMenuExpanded={setMenuExpanded} />
          <div className="page-content">
            <Header />
            <Routes>
              <Route path="/" element={<Calendar />} />
              <Route path="/user" element={<UserInfo />} />
              <Route path="/profile" element={<Profile/>} />
              <Route path="/adduser" element={userRole === "Manager" ? <AddUser /> : <Navigate to="/" />} />
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
