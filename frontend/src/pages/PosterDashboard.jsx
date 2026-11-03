import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';
import { getMyJobs, closeJob, getRatings } from '../api';
import '../styles/PosterDashboard.css';

export default function PosterDashboard() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [jobsRes, ratingsRes] = await Promise.all([
        getMyJobs(),
        user ? getRatings(user.id) : Promise.resolve({ success: false })
      ]);

      if (jobsRes.success) {
        setJobs(jobsRes.data || []);
      } else {
        setError(jobsRes.message || 'Failed to load your jobs');
      }

      if (ratingsRes.success && ratingsRes.data) {
        setRatingStats(ratingsRes.data);
      }
    } catch {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCloseJob = async (jobId) => {
    setActionError('');
    try {
      const res = await closeJob(jobId);
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: 'closed' } : j))
        );
      } else {
        setActionError(res.message || 'Failed to close job');
      }
    } catch {
      setActionError('Network error while closing job');
    }
  };

  return (
    <>
      <Navbar />
      <main className="main-container">
        <div className="posterdashboard-header">
          <h1 className="posterdashboard-title">Poster Dashboard</h1>
          <Link to="/post-job" className="btn">
            + Post new job
          </Link>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {actionError && <div className="alert-error">{actionError}</div>}

        {ratingStats && (
          <div className="posterdashboard-rating-card">
            <span className="posterdashboard-rating-label">My Employer Rating:</span>
            <RatingStars stars={ratingStats.average} />
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              ({ratingStats.count} review{ratingStats.count === 1 ? '' : 's'})
            </span>
            <Link to={`/profile/${user.id}`} style={{ marginLeft: 'auto', color: 'var(--accent-color)', fontWeight: 500 }}>
              View My Public Profile
            </Link>
          </div>
        )}

        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>My Posted Jobs</h2>

          {loading && <div className="state-message">Loading jobs...</div>}

          {!loading && jobs.length === 0 && (
            <div className="card state-message">
              You haven't posted any jobs yet.{' '}
              <Link to="/post-job" style={{ color: 'var(--accent-color)' }}>
                Post your first job now!
              </Link>
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Applicants</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <Link to={`/jobs/${job.id}`} style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                          {job.title}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge badge-${job.status}`}>{job.status}</span>
                      </td>
                      <td>{job.view_count}</td>
                      <td>{job.applicant_count}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="posterdashboard-actions-cell">
                          <Link
                            to={`/jobs/${job.id}/applicants`}
                            className="btn btn-secondary"
                            style={{ minHeight: '36px', padding: '6px 12px', fontSize: '14px' }}
                          >
                            Applicants ({job.applicant_count})
                          </Link>
                          {job.status === 'open' && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ minHeight: '36px', padding: '6px 12px', fontSize: '14px' }}
                              onClick={() => handleCloseJob(job.id)}
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
