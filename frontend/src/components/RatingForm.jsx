import { useState } from 'react';
import { addRating } from '../api';
import '../styles/RatingForm.css';

export default function RatingForm({ jobId, ratedId, onSuccess, onCancel }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await addRating({
        job_id: jobId,
        rated_id: ratedId,
        stars,
        comment
      });

      if (res.success) {
        if (onSuccess) onSuccess(res.data);
      } else {
        setError(res.message || 'Failed to submit rating');
      }
    } catch {
      setError('An unexpected network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ratingform-card" onSubmit={handleSubmit}>
      <h4 className="ratingform-title">Leave a Review</h4>

      {error && <div className="alert-error">{error}</div>}

      <div className="ratingform-stars">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            className={`ratingform-star-btn ${s <= stars ? 'active' : ''}`}
            onClick={() => setStars(s)}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        className="textarea ratingform-textarea"
        placeholder="Write an optional comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="ratingform-actions">
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Rating'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
