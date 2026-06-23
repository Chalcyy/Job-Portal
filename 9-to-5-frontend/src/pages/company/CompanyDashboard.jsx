import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatExperience, formatSalary } from '../../utils/format';

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    jobsApi
      .companyJobs()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this job posting?')) return;
    try {
      await jobsApi.remove(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  const activeJobs = jobs.filter((j) => j.isActive);

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Company Dashboard</h1>
          <p className="muted">Manage your job postings and applicants</p>
        </div>
        <Link to="/company/jobs/new" className="btn btn-primary">
          Post new job
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {activeJobs.length === 0 ? (
        <div className="empty-state">
          <h3>No job postings yet</h3>
          <p>Create your first job listing to start receiving applications.</p>
          <Link to="/company/jobs/new" className="btn btn-primary">
            Post a job
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Experience</th>
                <th>Salary</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeJobs.map((job) => (
                <tr key={job._id}>
                  <td>{job.title}</td>
                  <td>{job.location}</td>
                  <td>{formatExperience(job.experienceMin, job.experienceMax)}</td>
                  <td>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</td>
                  <td>{formatDate(job.createdAt)}</td>
                  <td className="table-actions">
                    <Link to={`/company/jobs/${job._id}/applications`} className="btn btn-outline btn-sm">
                      Applicants
                    </Link>
                    <Link to={`/company/jobs/${job._id}/edit`} className="btn btn-outline btn-sm">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeactivate(job._id)}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
