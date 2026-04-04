import { NavLink } from "react-router-dom";
import LOGO from './img/LOGO.png';

const Header = () => {
  return (
    <div className="p-3 navigation">
      <div className="container col-xxl-8 px-4  ">
        <div className=" d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
          <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
            <li className="navi">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link px-2 navigation-text${isActive ? ' active' : ''}`}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/Project"
                className={({ isActive }) => `nav-link px-2 navigation-text${isActive ? ' active' : ''}`}
              >
                Projects
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/About"
                className={({ isActive }) => `nav-link px-2 navigation-text${isActive ? ' active' : ''}`}
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/Contact"
                className={({ isActive }) => `nav-link px-2 navigation-text${isActive ? ' active' : ''}`}
              >
                Contact
              </NavLink>
            </li>
          </ul>
          <img src={LOGO} alt="logo" height="80"/>
        </div>
      </div>
    </div>
  );
};
export default Header;
