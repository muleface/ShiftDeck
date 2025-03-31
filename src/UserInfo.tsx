import { useState, useEffect, useContext } from 'react';
import internService from './API_Services/blablah.tsx';
import {Intern} from './API_Services/Models.tsx';
import "./UserInfo.css";
import { AppContext } from "./AppContext";

function UserInfo() {
  const [intern, setIntern] = useState<Intern>();
  const context = useContext(AppContext);
  
    if (!context) {
      throw new Error("useUserContext must be used within a UserContext.Provider");
    }
  
    const {searchedUser} = context;
  useEffect(() => {
    if(searchedUser!==0)
    {
      internService.getInternById(searchedUser)
      .then(data => {
        setIntern(data);
      })
      .catch(err => console.error('Error intern:', err));
    }
  }, [searchedUser]);
  if(searchedUser===0)
  {
    return(
    <p>you have to choose an intern first</p>
    );
  }
  return (
    <div className="info">
      <h2>Intern Info</h2>
      <p>FIrst Name: {intern?.firstName}</p>
      <p>Last Name: {intern?.lastName}</p>
      <p>Department: {intern?.department}</p>
    </div>
  );
}

export default UserInfo;
