import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/format';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    applicationsApi
      .mine()
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return;
    try {
      await applicationsApi.withdraw(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container page">
      <h1>My Applications</h1>
      {error && <div className="alert alert-error">{error}</div>}

      {applications.length === 0 ? (
        <div className="empty-state">
          <h3>No applications yet</h3>
          <p>Start applying to jobs that match your skills.</p>
          <Link to="/" className="btn btn-primary">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((app) => (
            <div key={app._id} className="application-row">
              <div>
                <Link to={`/jobs/${app.job?._id}`} className="application-title">
                  {app.job?.title}
                </Link>
                <p className="muted">
                  {app.job?.company?.name} · {app.job?.location} · Applied {formatDate(app.createdAt)}
                </p>
              </div>
              <div className="application-actions">
                <StatusBadge status={app.status} />
                {app.status === 'applied' && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleWithdraw(app._id)}
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
