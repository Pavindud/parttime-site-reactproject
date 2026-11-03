import { Link } from 'react-router-dom';
import '../styles/JobCard.css';

export default function JobCard({ job }) {
  if (!job) return null;

  return (
    <div className="jobcard-card">
      <div className="jobcard-header">
        <h3 className="jobcard-title">{job.title}</h3>
        <span className="jobcard-pay">${job.pay}</span>
      </div>

      <div className="jobcard-details">
        <span className="jobcard-location">📍 {job.location}</span>
        <span className="jobcard-poster">Posted by: {job.poster_name}</span>
      </div>

      <div className="jobcard-footer">
        <Link to={`/jobs/${job.id}`} className="btn btn-secondary">
          View job
        </Link>
      </div>
    </div>
  );
}
