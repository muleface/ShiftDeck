import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage.tsx';
function LoggedIn(props:{username:string,logged:boolean}){
    if(props.logged)
    {
        return(
            <div>
                <p>welcome {props.username}, please enter</p>
                <Router>
                    <nav>
                        <Link to="/"><button>Home</button></Link>
                    </nav>
                    <Routes>
                        <Route path="/" element={<HomePage/>} />
                    </Routes>
                </Router>
            </div>
        );
    }
    else{
        return(
            <div>
                <p>who the hell are you? log in!</p>
            </div>
        );
    }
    
}

export default LoggedIn