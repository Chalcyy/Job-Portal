import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { applicationsApi, jobsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatExperience, formatJobType, formatSalary } from '../utils/format';

export default function JobDetail() {
  const { id } = useParams();
  const { isAuthenticated, role } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    jobsApi
      .get(id)
      .then(setJob)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyError('');
    try {
      const formData = new FormData();
      if (coverLetter) formData.append('coverLetter', coverLetter);
      if (resumeFile) formData.append('resume', resumeFile);
      await applicationsApi.apply(id, formData);
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container alert alert-error">{error}</div>;
  if (!job) return null;

  const company = job.company;

  return (
    <div className="container job-detail">
      <div className="job-detail-main">
        <div className="job-detail-header">
          <div className="company-logo lg">{company?.name?.[0] || 'C'}</div>
          <div>
            <h1>{job.title}</h1>
            <Link to={`/companies/${company?._id}`} className="company-link">
              {company?.name}
            </Link>
            <div className="job-detail-meta">
              <span>{job.location}</span>
              <span>{formatExperience(job.experienceMin, job.experienceMax)}</span>
              <span className="capitalize">{formatJobType(job.jobType)}</span>
              <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
            </div>
          </div>
        </div>

        {job.skills?.length > 0 && (
          <section>
            <h2>Key skills</h2>
            <div className="skill-tags">
              {job.skills.map((skill) => (
                <span key={skill} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2>Job description</h2>
          <div className="job-description">{job.description}</div>
        </section>

        {job.applicationDeadline && (
          <p className="deadline">Apply before {formatDate(job.applicationDeadline)}</p>
        )}
      </div>

      <aside className="apply-panel">
        {!isAuthenticated && (
          <div className="apply-card">
            <h3>Interested in this role?</h3>
            <p>Login as a candidate to apply.</p>
            <Link to="/login" className="btn btn-primary btn-block">
              Login to apply
            </Link>
          </div>
        )}

        {isAuthenticated && role === 'company' && (
          <div className="apply-card">
            <p>Companies cannot apply to jobs. Browse your dashboard to manage postings.</p>
            <Link to="/company/dashboard" className="btn btn-outline btn-block">
              Go to dashboard
            </Link>
          </div>
        )}

        {isAuthenticated && role === 'candidate' && applySuccess && (
          <div className="apply-card success">
            <h3>Application submitted!</h3>
            <p>Track your application status in My Applications.</p>
            <Link to="/applications" className="btn btn-primary btn-block">
              View applications
            </Link>
          </div>
        )}

        {isAuthenticated && role === 'candidate' && !applySuccess && (
          <form className="apply-card" onSubmit={handleApply}>
            <h3>Apply for this job</h3>
            {applyError && <div className="alert alert-error">{applyError}</div>}
            <label>
              Cover letter (optional)
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Why are you a good fit?"
              />
            </label>
            <label>
              Upload resume (optional)
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
            </label>
            <button type="submit" className="btn btn-primary btn-block" disabled={applying}>
              {applying ? 'Submitting...' : 'Apply now'}
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}
