import React, { useState, useEffect, useContext, createContext } from 'react';
import {createPortal} from 'react-dom';
import './AppContext.module.css';
import {Intern, createIntern, Shift, createShift, Station, StationRole, createStationRole, JSConstraint} from './API_Services/Models.tsx';
import internService from './API_Services/internService.tsx';
import shiftService from './API_Services/shiftService.tsx';
import stationService from './API_Services/stationService.tsx';
import stationRoleService from './API_Services/stationRoleService.tsx';
import {jwtDecode} from 'jwt-decode';
import JSConstraintService from './API_Services/JSConstraintService.tsx';

interface AppContextType {
    //user-related variables
    user: Intern|undefined;
    setUser: (user:Intern|undefined) => void;
    
    userRole:string;
    setUserRole: (userRole:string) => void;

    //interns-related variables
    allInterns: Intern[];
    setAllInterns: (interns:Intern[]) => void;
    searchedUser: number;
    setSearchedUser: (userId:number) => void;

    //stations-related variables
    allStations:Station[];
    setAllStations: (stations:Station[]) => void;

    //NEW: station roles and constraints
    stationRoles: StationRole[];
    setStationRoles: (roles:StationRole[]) => void;
    jsConstraints: JSConstraint[];
    setJsConstraints: (constraints:JSConstraint[]) => void;

    //menu-related variables
    menuExpanded:boolean,
    setMenuExpanded: (expanded:boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

function ErrorPopUp(msg:string) { //handles the popup error, given a message.
   return createPortal(
   <div className="errorPopUp"> 
   {msg}
   <button className="closeButton" onClick={e => {e.currentTarget.parentElement?.style.setProperty('display', 'none');}} /> 
   </div>, document.body); 
}

export function AppProvider({children}:{ children:React.ReactNode }) {
    // initial values to pass over to child components
    const [userRole, setUserRole] = useState<string>("Intern");
    const [user, setUser] = useState<Intern>();
    const [menuExpanded, setMenuExpanded] = useState(false);
    const [allInterns, setAllInterns] = useState<Intern[]>([]);
    const [allStations, setAllStations] = useState<Station[]>([]);
    const [searchedUser, setSearchedUser] = useState<number>(0);
    
    // NEW: state for station roles and constraints
    const [stationRoles, setStationRoles] = useState<StationRole[]>([]);
    const [jsConstraints, setJsConstraints] = useState<JSConstraint[]>([]);

    //Fetching data with every mount
    useEffect(() => {
        // Existing data fetching
        internService.getAllInterns()
          .then(data => {
            setAllInterns(data);
          })
          .catch(err => {
            console.error('Error fetching all interns:', err)
            ErrorPopUp("Error fetching interns. Please refresh the page.")
          });
          
        stationService.getAllStations()
          .then(data => {
            setAllStations(data);
          })
          .catch(err => {
            console.error('Error fetching all stations:', err);
            ErrorPopUp("Error fetching stations. Please refresh the page.");
          });
          
        // NEW: Fetch station roles
        stationRoleService.getAllRoles()
          .then(data => {
            setStationRoles(data);
          })
          .catch(err => {
            console.error('Error fetching station roles:', err);
            ErrorPopUp("Error fetching station roles. Please refresh the page.");
          });
          
        // NEW: Fetch JS constraints
        JSConstraintService.getAllConstraints()
          .then(data => {
            setJsConstraints(data);
          })
          .catch(err => {
            console.error('Error fetching JS constraints:', err);
            ErrorPopUp("Error fetching JS constraints. Please refresh the page.");
          });
      }, []);
    
    //expanding or closing the side navbar
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

    

    interface DecodedToken {
      internId: string;
      exp: number;
    }
    
    useEffect(() => {
      const token = localStorage.getItem("token");
    
      if (!token) return;
    
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
    
        if (decoded.exp < currentTime) {
          console.warn("Token expired.");
          localStorage.removeItem("token");
          setUser(undefined);
          return;
        }
    
        const internId = parseInt(decoded.internId);
        if (!internId || isNaN(internId)) {
          console.warn("Invalid intern ID in token.");
          localStorage.removeItem("token");
          setUser(undefined);
          return;
        }
    
        // Set role from token
        setUserRole(decoded.role || "Intern");
    
        // Fetch intern data
        internService.getInternById(internId)
          .then(intern => setUser(intern))
          .catch(err => {
            console.error("Failed to fetch intern by ID", err);
            localStorage.removeItem("token");
            setUser(undefined);
          });
    
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        setUser(undefined);
      }
    }, []);

    return (
      <AppContext.Provider value={ { 
                                user, setUser,
                                userRole, setUserRole, 
                                menuExpanded, setMenuExpanded,
                                allInterns, setAllInterns,
                                allStations, setAllStations,
                                searchedUser, setSearchedUser,
                                // NEW: Added station roles and constraints
                                stationRoles, setStationRoles,
                                jsConstraints, setJsConstraints
                              }}>
            { children }
      </AppContext.Provider>
    );
}




