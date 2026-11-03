import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { getJobs } from '../api';
import '../styles/Home.css';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async (term = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await getJobs(term);
      if (res.success) {
        setJobs(res.data || []);
      } else {
        setError(res.message || 'Failed to fetch jobs');
      }
    } catch {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(search);
  };

  return (
    <>
      <Navbar />
      <main className="main-container">
        <section className="home-hero">
          <h1 className="home-title">Find Part-Time Jobs</h1>
          <p className="home-subtitle">Browse student-friendly and flexible part-time positions.</p>
          <form className="home-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="input home-search-input"
              placeholder="Search by title, location or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn">
              Search
            </button>
          </form>
        </section>

        <section>
          <h2 className="home-section-title">Latest Open Jobs</h2>

          {loading && <div className="state-message">Loading jobs...</div>}

          {error && <div className="alert-error">{error}</div>}

          {!loading && !error && jobs.length === 0 && (
            <div className="state-message">No open jobs found.</div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="home-jobs-list">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
