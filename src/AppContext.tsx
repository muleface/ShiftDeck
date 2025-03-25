import React, { useState, useEffect, useContext, createContext } from 'react';
import {createPortal} from 'react-dom';
import './AppContext.module.css';
import {Intern, createIntern, Shift, createShift, Station, StationRole, createStationRole} from './API_Services/Models.tsx';
import internService from './API_Services/internService.tsx';
import shiftService from './API_Services/shiftService.tsx';
import stationService from './API_Services/stationService.tsx';


interface AppContextType {
    //user-related variables
    user: string;
    setUser: (user:string) => void; //just defining the function, idk about dispatches.
    isLogged: boolean;
    setIsLogged: (isLogged:boolean) => void;

    //interns-related variables
    allInterns: Intern[];
    setAllInterns: (interns:Intern[]) => void;
    searchedUser: number;
    setSearchedUser: (userId:number) => void;

    //stations-related variables
    allStations:Station[];
    setAllStations: (stations:Station[]) => void;

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
    const [isLogged, setIsLogged] = useState(false);
    const [user, setUser] = useState("");
    const [menuExpanded, setMenuExpanded] = useState(false);
    const [allInterns, setAllInterns] = useState<Intern[]>([]);
    const [allStations, setAllStations] = useState<Station[]>([]);
    const [searchedUser, setSearchedUser] = useState<number>(0);

    //Fetching the interns list with every mount
    useEffect(() => {
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
          })
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

    return (<AppContext.Provider value={ {isLogged, setIsLogged, 
                                user, setUser, 
                                menuExpanded, setMenuExpanded,
                                allInterns, setAllInterns,
                                allStations, setAllStations,
                                searchedUser, setSearchedUser}}>
            { children }
            </AppContext.Provider>);
}




