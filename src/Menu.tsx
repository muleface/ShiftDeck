import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import './Menu.css';
import SearchIntern from './SearchIntern';
import { AppContext } from "./AppContext";

interface MenuProps {
  setMenuExpanded:  (expanded:boolean) => void;
}

function Menu({ setMenuExpanded }: MenuProps) {
  const userContext = useContext(AppContext);
  if (!userContext) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }
  const { user, setUser, status,setStatus, } = userContext;

  const handleMouseEnter = () => {
    setMenuExpanded(true);
  };

  const handleMouseLeave = () => {
    setMenuExpanded(false);
  };

  return (
    <div
      className="menu"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="menu-content">
        <nav>
          <ul>
            <li><Link to="/"><button>Calendar</button></Link></li>
            {(status!=0)?(<li><Link to="/adduser"><button>Add Intern</button></Link></li>):("")}
            
            <SearchIntern/>
          </ul>
        </nav>
      </div>
      <button className="signout" onClick={()=>{setUser(undefined);setStatus(0);}}>Sign Out</button>
    </div>
  );
}

export default Menu;
