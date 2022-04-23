import { ArrowDropDown } from "@material-ui/icons";
import HomeSharpIcon from '@material-ui/icons/HomeSharp';
import ContactPageSharpIcon from '@material-ui/icons/ContactPhoneSharp';
import InfoSharpIcon from '@material-ui/icons/InfoSharp';
import {useSelector} from 'react-redux';
import "./navbar.css";


const Navbar = () => {
  const name = useSelector((state) => state.user.userInfo.name)
  return (
    <div className="navbar">
      <div className="navbarWrapper">
        <div className="navbarLeft">
          <span className="logo"> Buenas App</span>
          <span className="navbarLink"><HomeSharpIcon/> Home</span>
          <span className="navbarLink"><InfoSharpIcon/> About</span>
          <span className="navbarLink"><ContactPageSharpIcon/> Contact</span>
        </div>
        <div className="navbarCenter">
          <div className="search">
            <input
              type="text"
              placeholder="search for something..."
              className="searchInput"
            />
          </div>
        </div>
        <div className="navbarRight">
          <img
            className="avatar"
            src="https://images.pexels.com/photos/3024627/pexels-photo-3024627.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
            alt=""
          />
          <span className="navbarName">{name}</span>
          <ArrowDropDown />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
