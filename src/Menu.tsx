import { Link } from 'react-router-dom';
import './Menu.css';
import SearchIntern from './SearchIntern';

interface MenuProps {
  setMenuExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

function Menu({ setMenuExpanded }: MenuProps) {
  const handleMouseEnter = () => {
    setMenuExpanded(true);
  };

  const handleMouseLeave = () => {
    setMenuExpanded(false);
  };

  return (
    <div
      className="menu"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="menu-content">
        <nav>
          <ul>
            <li><Link to="/home"><button>Home</button></Link></li>
            <li><Link to="/calendar"><button>Calendar</button></Link></li>
            <li><button>add worker</button></li>
            <li><Link to="/search"><button>Search</button></Link></li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Menu;
