import { useState } from 'react'
import './App.css'
import Calendar from './Calendar.tsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Calendar />
  )
}

export default App
