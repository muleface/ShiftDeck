import { useState, useEffect, useContext } from 'react';
import internService from './API_Services/internService.tsx';
import {Intern} from './API_Services/Models.tsx';

function UserInfo(props:{id:number}) {
  const [intern, setIntern] = useState<Intern>();
  // Fetch all interns when the component mounts
  useEffect(() => {
    if(props.id!==0)
    {
      internService.getInternById(props.id)
      .then(data => {
        setIntern(data);
      })
      .catch(err => console.error('Error intern:', err));
    }
  }, []);
  if(props.id===0)
  {
    return(
    <p>you have to choose an intern first</p>
    );
  }
  return (
    <div className="Search-container">
      <h2>Intern Info</h2>
      <p>FIrst Name: {intern?.firstName}</p>
      <p>Last Name: {intern?.lastName}</p>
      <p>Department: {intern?.department}</p>
    </div>
  );
}

export default UserInfo;
