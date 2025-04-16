import React, { useState, useEffect } from 'react';
import internService from './API_Services/InternService.tsx';
import {Intern} from './API_Services/Models.tsx';

function InternTester() {
  const [allInterns, setAllInterns] = useState<Intern[]>([]);
 // const [singleIntern, setSingleIntern] = useState<Intern | null>(null);
 // const [searchResults, setSearchResults] = useState<Intern[]>([]);

  useEffect(() => {
    // Test getAllInterns
    internService.getAllInterns()
      .then(data => setAllInterns(data))
      .catch(err => console.error('Error fetching all interns:', err));
    
    // Test getInternById (using ID 1 as an example)
    // internService.getInternById(1)
    //  .then(data => setSingleIntern(data))
    // .catch(err => console.error('Error fetching intern by ID:', err));
    
    // Test getInternsByName (using 'Smith' as an example)
    //internService.getInternsByName('Epstein')
    // .then(data => setSearchResults(data))
    // .catch(err => console.error('Error searching interns:', err));
  }, []);

  return (
    <div>
      <h2>API Test Results</h2>
      
      <h3>All Interns:</h3>
      <pre>{JSON.stringify(allInterns, null, 2)}</pre>
    </div>
  );
};

export default InternTester;

/*
<h3>Single Intern (ID: 1):</h3>
<pre>{JSON.stringify(singleIntern, null, 2)}</pre>

<h3>Search Results (Name: 'Smith'):</h3>
<pre>{JSON.stringify(searchResults, null, 2)}</pre> 
*/