import { Link } from 'react-router-dom';
import './Menu.css';
import SearchIntern from './SearchIntern';

interface MenuProps {
  setMenuExpanded:  (expanded:boolean) => void;
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
            <li><Link to="/"><button>Calendar</button></Link></li>
            <li><button>add worker</button></li>
            <SearchIntern/>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Menu;
