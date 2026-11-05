import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginUser({ email, password });
      if (res.success && res.data) {
        login(res.data);
        if (res.data.role === 'employee') {
          navigate('/employee');
        } else if (res.data.role === 'poster') {
          navigate('/poster');
        } else {
          navigate('/');
        }
      } else {
        setError(res.message || 'Invalid email or password');
      }
    } catch {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar className="navbar"/>
      <div className="login-container">
        <div className="card">
          <h2 className="login-title">Log In</h2>
          <p className="login-subtitle">Access your account and manage jobs or applications.</p>

          {error && <div className="alert-error">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </>
  );
}
