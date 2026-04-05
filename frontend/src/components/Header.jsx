import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import LOGO from "./img/LOGO.png";

const NAV_LINKS = [
  { to: "/", end: true, label: "Home" },
  { to: "/Project", label: "Projects" },
  { to: "/About", label: "About" },
  { to: "/Contact", label: "Contact" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 992px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="p-3 navigation">
      <div className="container col-xxl-8 px-4">
        <div className="header-shell d-flex flex-wrap align-items-center justify-content-lg-start">
          <button
            type="button"
            className="header-hamburger d-lg-none btn btn-link text-warning p-1 border-0 shadow-none"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <FaTimes size={26} /> : <FaBars size={26} />}
          </button>

          <ul
            className={`nav header-site-nav col-12 col-lg-auto me-lg-auto mb-0 justify-content-center justify-content-lg-start ${
              menuOpen ? "header-site-nav--open" : ""
            }`}
          >
            {NAV_LINKS.map(({ to, end, label }) => (
              <li key={to} className={to === "/" ? "navi" : ""}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `nav-link px-2 navigation-text${isActive ? " active" : ""}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <span className="header-brand-wrap d-flex align-items-center flex-shrink-0">
            <img
              src={LOGO}
              alt="logo"
              className="header-brand-logo d-block"
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
