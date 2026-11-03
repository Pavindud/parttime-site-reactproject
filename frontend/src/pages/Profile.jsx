import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RatingStars from '../components/RatingStars';
import { getRatings } from '../api';
import '../styles/Profile.css';

export default function Profile() {
  const { id } = useParams();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await getRatings(id);
      if (res.success && res.data) {
        setProfileData(res.data);
      } else {
        setError(res.message || 'User not found');
      }
    } catch {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  return (
    <>
      <Navbar />
      <div className="profile-container">
        {loading && <div className="state-message">Loading profile...</div>}

        {error && <div className="alert-error">{error}</div>}

        {!loading && !error && profileData && (
          <>
            <div className="card profile-header-card">
              <div>
                <h1 className="profile-name">{profileData.user.name}</h1>
                <span className="badge badge-completed profile-role-badge">
                  {profileData.user.role}
                </span>
              </div>
              <div className="profile-rating-summary">
                <RatingStars stars={profileData.average} />
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  {profileData.count} review{profileData.count === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <section>
              <h2 className="profile-reviews-title">Reviews & Feedback</h2>

              {profileData.reviews.length === 0 && (
                <div className="card state-message">No reviews have been left for this user yet.</div>
              )}

              {profileData.reviews.map((rev, index) => (
                <div key={index} className="profile-review-card">
                  <div className="profile-review-header">
                    <div>
                      <span className="profile-review-rater">{rev.rater_name}</span>
                      <span className="profile-review-job"> • For: {rev.job_title}</span>
                    </div>
                    <span className="profile-review-date">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <RatingStars stars={rev.stars} />
                  {rev.comment && <p className="profile-review-comment">{rev.comment}</p>}
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </>
  );
}
