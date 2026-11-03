import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createJob } from '../api';
import '../styles/PostJob.css';

export default function PostJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pay, setPay] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await createJob({
        title,
        description,
        pay: parseFloat(pay),
        location
      });

      if (res.success && res.data) {
        navigate('/poster');
      } else {
        setError(res.message || 'Failed to post job');
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
      <div className="postjob-container">
        <div className="card">
          <h2 className="postjob-title">Post a New Job</h2>
          <p className="postjob-subtitle">Provide details to attract the best candidates for your part-time opening.</p>

          {error && <div className="alert-error">{error}</div>}

          <form className="postjob-form" onSubmit={handleSubmit}>
            <div className="postjob-field">
              <label className="postjob-label" htmlFor="postjob-title">
                Job Title
              </label>
              <input
                id="postjob-title"
                type="text"
                className="input"
                required
                placeholder="e.g. Weekend Barista, Math Tutor"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="postjob-field">
              <label className="postjob-label" htmlFor="postjob-pay">
                Pay / Hourly Rate ($)
              </label>
              <input
                id="postjob-pay"
                type="number"
                step="0.01"
                min="0"
                className="input"
                required
                placeholder="e.g. 18.50"
                value={pay}
                onChange={(e) => setPay(e.target.value)}
              />
            </div>

            <div className="postjob-field">
              <label className="postjob-label" htmlFor="postjob-location">
                Location
              </label>
              <input
                id="postjob-location"
                type="text"
                className="input"
                required
                placeholder="e.g. Downtown, Campus Library, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="postjob-field">
              <label className="postjob-label" htmlFor="postjob-desc">
                Job Description
              </label>
              <textarea
                id="postjob-desc"
                className="textarea"
                required
                rows={5}
                placeholder="Describe responsibilities, shifts, requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="postjob-actions">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Posting...' : 'Post Job'}
              </button>
              <Link to="/poster" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
