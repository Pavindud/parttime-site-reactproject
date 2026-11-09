import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';
import { getJob, applyToJob } from '../api';
import '../styles/JobDetails.css';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');

  const fetchJobDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getJob(id);
      if (res.success && res.data) {
        setJob(res.data);
      } else {
        setError(res.message || 'Job not found');
      }
    } catch {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    setApplyError('');
    try {
      const res = await applyToJob(job.id);
      if (res.success) {
        setJob((prev) => ({
          ...prev,
          has_applied: true,
          applicant_count: (prev.applicant_count || 0) + 1
        }));
      } else {
        if (res.message === 'Unauthorized') {
          setApplyError('Your session has expired. Please log in again to apply.');
        } else {
          setApplyError(res.message || 'Failed to submit application');
        }
      }
    } catch {
      setApplyError('Could not submit application due to network error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="jobdetails-container">
        {loading && <div className="state-message">Loading job details...</div>}

        {error && <div className="alert-error">{error}</div>}

        {!loading && !error && job && (
          <div className="card">
            <div className="jobdetails-header">
              <div>
                <h1 className="jobdetails-title">{job.title}</h1>
                <div className="jobdetails-meta">
                  <span>📍 {job.location}</span>
                  <span className={`badge badge-${job.status}`}>{job.status}</span>
                </div>
              </div>
              <div className="jobdetails-pay">Rs.{job.pay}</div>
            </div>

            <div className="jobdetails-section">
              <h3 className="jobdetails-section-title">Job Description</h3>
              <p className="jobdetails-description">{job.description}</p>
            </div>

            <div className="jobdetails-section">
              <h3 className="jobdetails-section-title">Posted By</h3>
              <p>
                <Link to={`/profile/${job.poster_id}`} style={{ fontWeight: 600, color: 'var(--accent-color)' }}>
                  {job.poster_name}
                </Link>{' '}
                <RatingStars stars={job.poster_rating} />
              </p>
            </div>

            <div className="jobdetails-stats">
              <div className="jobdetails-stat-item">
                <span className="jobdetails-stat-label">Views</span>
                <span className="jobdetails-stat-value">{job.view_count}</span>
              </div>
              <div className="jobdetails-stat-item">
                <span className="jobdetails-stat-label">Applicants</span>
                <span className="jobdetails-stat-value">{job.applicant_count}</span>
              </div>
            </div>

            {applyError && <div className="alert-error" style={{ marginTop: '16px' }}>{applyError}</div>}

            <div className="jobdetails-actions">
              {!user && (
                <div className="jobdetails-login-prompt">
                  Want to apply? <Link to="/login">Log in as an employee</Link> to apply for this job.
                </div>
              )}

              {user && user.role === 'employee' && (
                <button
                  type="button"
                  className="btn"
                  disabled={job.status !== 'open' || job.has_applied || applying}
                  onClick={handleApply}
                >
                  {job.has_applied ? 'Applied' : applying ? 'Submitting...' : 'Apply Now'}
                </button>
              )}

              {user && user.role === 'poster' && (
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  You are logged in as an employer.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
