import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getJob, updateJob } from '../api';
import '../styles/EditJob.css';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pay, setPay] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getJob(id);
        if (res.success && res.data) {
          if (user && res.data.poster_id !== user.id) {
            setIsOwner(false);
            setError('Forbidden: You are not the owner of this job');
          }
          setTitle(res.data.title || '');
          setDescription(res.data.description || '');
          setPay(res.data.pay !== undefined && res.data.pay !== null ? String(res.data.pay) : '');
          setLocation(res.data.location || '');
        } else {
          setError(res.message || 'Failed to load job details');
        }
      } catch {
        setError('Could not connect to the server');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await updateJob(id, {
        title,
        description,
        pay: parseFloat(pay),
        location
      });

      if (res.success) {
        navigate('/poster');
      } else {
        setError(res.message || 'Failed to update job');
      }
    } catch {
      setError('Could not connect to the server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="editjob-container">
        <div className="card">
          <h2 className="editjob-title">Edit Job</h2>
          <p className="editjob-subtitle">Update the details for your part-time opening.</p>

          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="state-message">Loading job details...</div>
          ) : !isOwner ? (
            <div className="editjob-actions">
              <Link to="/poster" className="btn btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <form className="editjob-form" onSubmit={handleSubmit}>
              <div className="editjob-field">
                <label className="editjob-label" htmlFor="editjob-title">
                  Job Title
                </label>
                <input
                  id="editjob-title"
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. Weekend cashier , Maths Tutor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="editjob-field">
                <label className="editjob-label" htmlFor="editjob-pay">
                  Pay / Hourly Rate (Rs.)
                </label>
                <input
                  id="editjob-pay"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input"
                  required
                  placeholder="e.g. 2000.00"
                  value={pay}
                  onChange={(e) => setPay(e.target.value)}
                />
              </div>

              <div className="editjob-field">
                <label className="editjob-label" htmlFor="editjob-location">
                  Location
                </label>
                <input
                  id="editjob-location"
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. Dehiwala, Katubedda , Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="editjob-field">
                <label className="editjob-label" htmlFor="editjob-desc">
                  Job Description
                </label>
                <textarea
                  id="editjob-desc"
                  className="textarea"
                  required
                  rows={5}
                  placeholder="Describe responsibilities, shifts, requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="editjob-actions">
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <Link to="/poster" className="btn btn-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
