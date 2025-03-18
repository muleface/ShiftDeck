import React, { useState, useEffect } from 'react';
import './App.css'
import LoggedIn from './LoggedIn.tsx'


function App() {
  const [islogged, setlogged] = useState(false);
  const logged = () => {
    setlogged(!islogged);
  };
  return ( 
    <>
      <LoggedIn username='yuval' logged={islogged}></LoggedIn>
      <button onClick={logged}>{islogged? 'log out': 'log in'}</button>
    </>
  )
}

export default App
