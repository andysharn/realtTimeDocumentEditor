import React from 'react';
import { Link, useHistory } from 'react-router-dom';

function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    history.push('/login');
  };

  return (
    <nav>
      <ul>
        {isAuthenticated ? (
          <>
            <li><Link to="/documents">My Documents</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;