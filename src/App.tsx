import React, { useState, useEffect } from 'react';
import './App.css'
import Calendar from './Calendar.tsx'
import Header from './Header.tsx'
import Footer from './Footer.tsx'
import LoggedIn from './LoggedIn.tsx'
import InternList from './InternList.tsx'


function App() {
  const [islogged, setlogged] = useState(false);
  const logged = () => {
    setlogged(!islogged);
  };
  return ( 
    <>
      <Header />
      <Calendar />
      <InternList />
      <Footer />
    </>
  )
}

export default App
