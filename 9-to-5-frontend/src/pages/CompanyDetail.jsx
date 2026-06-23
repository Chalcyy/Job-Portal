import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { companiesApi, jobsApi } from '../api/client';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [companyData, jobsData] = await Promise.all([
          companiesApi.get(id),
          jobsApi.list({ limit: 50 }),
        ]);
        setCompany(companyData);
        setJobs(jobsData.jobs.filter((j) => j.company?._id === id || j.company === id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container alert alert-error">{error}</div>;
  if (!company) return null;

  return (
    <div className="container page">
      <div className="company-profile-header">
        <div className="company-logo lg">{company.name[0]}</div>
        <div>
          <h1>{company.name}</h1>
          <p>{company.industry}</p>
          <p className="muted">{company.location}</p>
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer" className="link">
              Visit website
            </a>
          )}
        </div>
      </div>

      {company.description && (
        <section className="section">
          <h2>About</h2>
          <p>{company.description}</p>
        </section>
      )}

      <section className="section">
        <h2>Open positions ({jobs.length})</h2>
        {jobs.length === 0 ? (
          <p className="muted">No active job openings right now.</p>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      <Link to="/companies" className="link">
        ← Back to companies
      </Link>
    </div>
  );
}
