import './Header.css'
function Header(){
    return(
        <header>
            <h1> Shift Deck </h1>
            <ul>
                <li><button>home</button></li>
                <li><button>add worker</button></li>
                <li><button>search</button></li>
                <li><button>calendar</button></li>
            </ul>
            <hr></hr>
        </header>
    );
}
export default Header