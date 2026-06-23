import { Link } from 'react-router-dom';
import { formatExperience, formatJobType, formatSalary } from '../utils/format';

export default function JobCard({ job }) {
  const company = job.company?.name || 'Company';
  const logo = job.company?.logoUrl;

  return (
    <Link to={`/jobs/${job._id}`} className="job-card">
      <div className="job-card-header">
        <div className="company-logo">{logo ? <img src={logo} alt="" /> : company[0]}</div>
        <div>
          <h3>{job.title}</h3>
          <p className="company-name">{company}</p>
        </div>
      </div>
      <div className="job-card-meta">
        <span>{job.location}</span>
        <span>{formatExperience(job.experienceMin, job.experienceMax)}</span>
        <span className="capitalize">{formatJobType(job.jobType)}</span>
      </div>
      {job.skills?.length > 0 && (
        <div className="skill-tags">
          {job.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      )}
      <div className="job-card-footer">
        <span className="salary">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
        {job.openings > 1 && <span>{job.openings} openings</span>}
      </div>
    </Link>
  );
}
