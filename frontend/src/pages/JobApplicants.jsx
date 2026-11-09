import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RatingStars from '../components/RatingStars';
import RatingForm from '../components/RatingForm';
import { getApplicants, updateApplicationStatus, getJob } from '../api';
import '../styles/JobApplicants.css';

export default function JobApplicants() {
  const { id } = useParams();

  const [jobTitle, setJobTitle] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [appsRes, jobRes] = await Promise.all([
        getApplicants(id),
        getJob(id)
      ]);

      if (appsRes.success) {
        setApplicants(appsRes.data || []);
      } else {
        if (appsRes.message === 'Unauthorized') {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(appsRes.message || 'Failed to load applicants');
        }
      }

      if (jobRes.success && jobRes.data) {
        setJobTitle(jobRes.data.title);
      }
    } catch {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    document.getElementById("ratebtn").style.display = '';
    setActionError('');
    try {
      const res = await updateApplicationStatus(applicationId, newStatus);
      if (res.success) {
        setApplicants((prev) =>
          prev.map((app) =>
            app.application_id === applicationId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        setActionError(res.message || 'Failed to update status');
      }
    } catch {
      setActionError('Network error while updating application status');
    }
  };

  const handleRatingSuccess = (employeeId) => {
    setRatingTarget(null);
    setApplicants((prev) =>
      prev.map((app) =>
        app.employee_id === employeeId ? { ...app, has_rated: true } : app
      )
    );
  };
 function rateBtn(){
    document.getElementById("ratebtn").style.display = '';
 }
  return (
    <>
      <Navbar />
      <main className="main-container">
        <div className="jobapplicants-header">
          <div>
            <h1 className="jobapplicants-title">Applicants</h1>
            {jobTitle && (
              <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                For job: <strong>{jobTitle}</strong>
              </p>
            )}
          </div>
          <Link to="/poster" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {actionError && <div className="alert-error">{actionError}</div>}

        {loading && <div className="state-message">Loading applicants...</div>}

        {!loading && !error && applicants.length === 0 && (
          <div className="card state-message">No one has applied for this position yet.</div>
        )}

        {!loading && !error && applicants.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Rating</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((app) => (
                  <tr key={app.application_id}>
                    <td>
                      <Link to={`/profile/${app.employee_id}`} style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                        {app.employee_name}
                      </Link>
                    </td>
                    <td>
                      <RatingStars stars={app.employee_rating} />
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge badge-${app.status}`}>{app.status}</span>
                    </td>
                    <td>
                      <div className="jobapplicants-actions-cell">
                        {app.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="btn"
                              style={{ minHeight: '34px', padding: '4px 10px', fontSize: '13px' }}
                              onClick={() => handleStatusUpdate(app.application_id, 'accepted')}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ minHeight: '34px', padding: '4px 10px', fontSize: '13px' }}
                              onClick={() => handleStatusUpdate(app.application_id, 'rejected')}
                            >
                              Reject
                            </button>
                            
                          </>
                        )}
                        {app.status === 'accepted' && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ minHeight: '34px', padding: '4px 10px', fontSize: '13px' }}
                            onClick={() => {handleStatusUpdate(app.application_id, 'completed');ratebtn();}}
                          >
                            Mark completed
                          </button>
                        )}
                        {!app.has_rated ? (
                          <button
                            type="button"
                            className="btn btn-secondary" id="ratebtn"
                            style={{ minHeight: '34px', padding: '4px 10px', fontSize: '13px' ,display:'none'}}
                            onClick={() =>
                              setRatingTarget(
                                ratingTarget === app.employee_id ? null : app.employee_id
                              )
                            }
                          >
                            {ratingTarget === app.employee_id ? 'Close' : 'Rate employee'}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Rated</span>
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
            jobId={Number(id)}
            ratedId={ratingTarget}
            onSuccess={() => handleRatingSuccess(ratingTarget)}
            onCancel={() => setRatingTarget(null)}
          />
        )}
      </main>
    </>
  );
}
