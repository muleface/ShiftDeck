import React, { useState, useEffect } from 'react';
import './App.css'
import Calendar from './Calendar.tsx'
import Header from './Header.tsx'
import Footer from './Footer.tsx'
import LoggedIn from './LoggedIn.tsx'
import InternList from './InternList.tsx'
import InternTester from './InternTester.tsx'


function App() {
  const [islogged, setlogged] = useState(false);
  const logged = () => {
    setlogged(!islogged);
  };
  return ( 
    <>
      <Header />
      <InternTester />
      <Footer />
    </>
  )
}

export default App
