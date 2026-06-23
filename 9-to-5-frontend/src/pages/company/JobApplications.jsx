import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { applicationsApi, jobsApi } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, resumeUrl } from '../../utils/format';

const STATUSES = ['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected'];

export default function JobApplications() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [jobData, apps] = await Promise.all([jobsApi.get(id), applicationsApi.forJob(id)]);
        setJob(jobData);
        setApplications(apps);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const updateStatus = async (applicationId, status) => {
    try {
      await applicationsApi.updateStatus(applicationId, status);
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status } : app))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container alert alert-error">{error}</div>;

  return (
    <div className="container page">
      <Link to="/company/dashboard" className="link">
        ← Back to dashboard
      </Link>
      <h1>Applicants for {job?.title}</h1>
      <p className="muted">{applications.length} application(s)</p>

      {applications.length === 0 ? (
        <div className="empty-state">
          <h3>No applications yet</h3>
          <p>Share this job posting to attract candidates.</p>
        </div>
      ) : (
        <div className="applicants-list">
          {applications.map((app) => (
            <div key={app._id} className="applicant-card">
              <div className="applicant-header">
                <div>
                  <h3>{app.candidate?.name}</h3>
                  <p className="muted">{app.candidate?.email}</p>
                  {app.candidate?.headline && <p>{app.candidate.headline}</p>}
                </div>
                <StatusBadge status={app.status} />
              </div>

              {app.candidate?.skills?.length > 0 && (
                <div className="skill-tags">
                  {app.candidate.skills.map((skill) => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="applicant-meta">
                <span>Applied {formatDate(app.createdAt)}</span>
                {app.candidate?.phone && <span>{app.candidate.phone}</span>}
                {app.resumeUrl && (
                  <a href={resumeUrl(app.resumeUrl)} target="_blank" rel="noreferrer">
                    View resume
                  </a>
                )}
              </div>

              {app.status !== 'withdrawn' && (
                <div className="status-actions">
                  <label>
                    Update status
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app._id, e.target.value)}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
