import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RatingStars from '../components/RatingStars';
import RatingForm from '../components/RatingForm';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import { getMyApplications, getJobs, getRatings, withdrawApplication } from '../api';
import '../styles/EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [openJobs, setOpenJobs] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [ratingTarget, setRatingTarget] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [appsRes, jobsRes, ratingsRes] = await Promise.all([
        getMyApplications(),
        getJobs(),
        user ? getRatings(user.id) : Promise.resolve({ success: false })
      ]);

      if (appsRes.success) setApplications(appsRes.data || []);
      else setError(appsRes.message || 'Failed to load applications');

      if (jobsRes.success) setOpenJobs(jobsRes.data || []);

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

  const handleRatingSuccess = (jobId) => {
    setRatingTarget(null);
    setApplications((prev) =>
      prev.map((app) => (app.job_id === jobId ? { ...app, has_rated: true } : app))
    );
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }
    setActionError('');
    try {
      const res = await withdrawApplication(applicationId);
      if (res.success) {
        loadData();
      } else {
        setActionError(res.message || 'Failed to withdraw application');
      }
    } catch {
      setActionError('Network error while withdrawing application');
    }
  };

  return (
    <>
      <Navbar />
      <main className="main-container">
        <div className="employeedashboard-header">
          <h1 className="employeedashboard-title">Employee Dashboard</h1>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {actionError && <div className="alert-error">{actionError}</div>}

        {ratingStats && (
          <div className="employeedashboard-rating-card">
            <span className="employeedashboard-rating-label">My Average Rating:</span>
            <RatingStars stars={ratingStats.average} />
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              ({ratingStats.count} review{ratingStats.count === 1 ? '' : 's'})
            </span>
            <Link to={`/profile/${user.id}`} style={{ marginLeft: 'auto', color: 'var(--accent-color)', fontWeight: 500 }}>
              View My Public Profile
            </Link>
          </div>
        )}

        <section className="employeedashboard-section">
          <h2 className="employeedashboard-section-title">My Applications</h2>

          {loading && <div className="state-message">Loading applications...</div>}

          {!loading && applications.length === 0 && (
            <div className="card state-message">
              You have not applied for any jobs yet. Check out the open positions below!
            </div>
          )}

          {!loading && applications.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Employer</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <Link to={`/jobs/${app.job_id}`} style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                          {app.job_title}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/profile/${app.poster_id}`} style={{ color: 'var(--accent-color)' }}>
                          {app.poster_name}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge badge-${app.status}`}>{app.status}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="employeedashboard-rate-cell">
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {app.status === 'pending' && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ minHeight: '36px', padding: '6px 12px', fontSize: '14px' }}
                              onClick={() => handleWithdraw(app.id)}
                            >
                              Withdraw
                            </button>
                          )}
                          {app.has_rated ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Rated</span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ minHeight: '36px', padding: '6px 12px', fontSize: '14px' }}
                              onClick={() =>
                                setRatingTarget(
                                  ratingTarget?.jobId === app.job_id ? null : { jobId: app.job_id, posterId: app.poster_id }
                                )
                              }
                            >
                              {ratingTarget?.jobId === app.job_id ? 'Close' : 'Rate poster'}
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

          {ratingTarget && (
            <RatingForm
              jobId={ratingTarget.jobId}
              ratedId={ratingTarget.posterId}
              onSuccess={() => handleRatingSuccess(ratingTarget.jobId)}
              onCancel={() => setRatingTarget(null)}
            />
          )}
        </section>

        <section className="employeedashboard-section">
          <h2 className="employeedashboard-section-title">Explore Open Jobs</h2>
          {openJobs.length === 0 && !loading && (
            <div className="card state-message">No open jobs available right now.</div>
          )}
          {openJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </section>
      </main>
    </>
  );
}
