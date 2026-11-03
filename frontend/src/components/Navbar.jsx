import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api';
import '../styles/nav.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="nav">
      <h1><Link to="/">PartTimeJobs</Link></h1>
      <ul className="list">
        {!user && (
          <>
            <li><Link to="/">Jobs</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
        {user && user.role === 'employee' && (
          <>
            <li><Link to="/">Browse jobs</Link></li>
            <li><Link to="/employee">My applications</Link></li>
            <li><Link to={`/profile/${user.id}`}>Profile</Link></li>
            <li>
              <button type="button" className="nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        )}
        {user && user.role === 'poster' && (
          <>
            <li><Link to="/poster">My jobs</Link></li>
            <li><Link to="/post-job">Post a job</Link></li>
            <li><Link to={`/profile/${user.id}`}>Profile</Link></li>
            <li>
              <button type="button" className="nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
