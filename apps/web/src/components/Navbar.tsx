import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            📸 FaceID Lab
          </Link>
          <ul className="navbar-nav">
            <li>
              <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
                Início
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className={`navbar-link ${isActive('/register') ? 'active' : ''}`}
              >
                Cadastrar
              </Link>
            </li>
            <li>
              <Link
                to="/identify"
                className={`navbar-link ${isActive('/identify') ? 'active' : ''}`}
              >
                Identificar
              </Link>
            </li>
            <li>
              <Link to="/about" className={`navbar-link ${isActive('/about') ? 'active' : ''}`}>
                Sobre
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
