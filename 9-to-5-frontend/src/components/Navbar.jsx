import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">9</span>
          <span className="logo-text">to<span>5</span></span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Find Jobs
          </NavLink>
          <NavLink to="/companies">Companies</NavLink>
          {isAuthenticated && role === 'candidate' && (
            <>
              <NavLink to="/recommended">For You</NavLink>
              <NavLink to="/applications">My Applications</NavLink>
            </>
          )}
          {isAuthenticated && role === 'company' && (
            <>
              <NavLink to="/company/dashboard">Dashboard</NavLink>
              <NavLink to="/company/jobs/new">Post Job</NavLink>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <Link
                to={role === 'company' ? '/company/profile' : '/profile'}
                className="user-greeting"
              >
                Hi, {user?.name?.split(' ')[0]}
              </Link>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
