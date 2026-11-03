import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { registerUser } from '../api';
import '../styles/Register.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await registerUser({ name, email, password, role });
      if (res.success) {
        navigate('/login');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-container">
        <div className="card">
          <h2 className="register-title">Create an Account</h2>
          <p className="register-subtitle">Sign up to apply for jobs or hire part-time staff.</p>

          {error && <div className="alert-error">{error}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-field">
              <label className="register-label" htmlFor="register-name">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                className="input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label className="register-label" htmlFor="register-email">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                className="input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label className="register-label" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className="input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label className="register-label" htmlFor="register-role">
                I want to
              </label>
              <select
                id="register-role"
                className="select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="employee">Find part-time work (Employee)</option>
                <option value="poster">Post part-time jobs (Poster)</option>
              </select>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="register-footer">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </>
  );
}
