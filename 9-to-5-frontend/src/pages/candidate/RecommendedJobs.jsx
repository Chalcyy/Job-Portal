import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../api/client';
import JobCard from '../../components/JobCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function RecommendedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    jobsApi
      .recommended()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container page">
      <h1>Jobs for you</h1>
      <p className="muted">Personalized recommendations based on your skills and preferences</p>

      {error && <div className="alert alert-error">{error}</div>}

      {jobs.length === 0 ? (
        <div className="empty-state">
          <h3>No recommendations yet</h3>
          <p>Add skills and preferences to your profile to get matched jobs.</p>
          <Link to="/profile" className="btn btn-primary">
            Update profile
          </Link>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
