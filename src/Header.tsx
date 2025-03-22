import styles from './Header.module.css'
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import Calendar from './Calendar.tsx'
import HomePage from './HomePage.tsx'
function Header(){
    return(
        <header className={styles.header}>
            <h1> Shift Deck </h1>
            
            <hr></hr>
            <Router>
                <nav>
                    <ul className={styles.ul}>
                        <li><Link to="/home"><button>Home</button></Link></li>
                        <li><Link to="/calendar"><button>Calender</button></Link></li>
                        <li><button>add worker</button></li>
                        <li><button>search</button></li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/home" element={<HomePage/>} />
                    <Route path="/calendar" element={<Calendar/>} />
                </Routes>
            </Router>
        </header>
        
    );
}
export default Header