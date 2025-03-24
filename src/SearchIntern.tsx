import { useState, useEffect, useContext } from 'react';
import { UserContext } from "./App";
import internService from './API_Services/InternService';
import Intern from './API_Services/Models.tsx';

function SearchIntern() {
  const [name, setName] = useState('');
  const [allInterns, setAllInterns] = useState<Intern[]>([]);
  const [filteredInterns, setFilteredInterns] = useState<Intern[]>([]);

  // Fetch all interns when the component mounts
  useEffect(() => {
    internService.getAllInterns()
      .then(data => {
        setAllInterns(data);
      })
      .catch(err => console.error('Error fetching all interns:', err));
  }, []);

  useEffect(() => {
    if (name === '') {
      setFilteredInterns([]); // If the search field is empty, show all interns
    } else {
      const filtered = allInterns.filter((intern) => 
        intern.firstName.toLowerCase().startsWith(name.toLowerCase()) || 
        intern.lastName.toLowerCase().startsWith(name.toLowerCase())
      );
      setFilteredInterns(filtered);
    }
  }, [name]);

  return (
    <div className="Search-container">
      <h2>Search Interns</h2>
      <input 
        type="text" 
        placeholder="Search Name" 
        value={name} 
        onChange={(e) => setName(e.target.value)}
      />

      <h3>Filtered Interns:</h3>
      {filteredInterns.length > 0 ? (
        <ul>
          {filteredInterns.map((intern, index) => (
            <li key={index}>
              {intern.firstName} {intern.lastName}
            </li>
          ))}
        </ul>
      ) : (
        <p>No interns found matching your search</p>
      )}
    </div>
  );
}

export default SearchIntern;
