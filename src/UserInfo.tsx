import { useState, useEffect, useContext } from 'react';
import internService from './API_Services/InternService';
import Intern from './API_Services/Models.tsx';

function UserInfo(props:{id:number}) {
  const [intern, setIntern] = useState<Intern>();
  // Fetch all interns when the component mounts
  useEffect(() => {
    internService.getInternById(props.id)
      .then(data => {
        setIntern(data);
      })
      .catch(err => console.error('Error intern:', err));
  }, []);
 
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
