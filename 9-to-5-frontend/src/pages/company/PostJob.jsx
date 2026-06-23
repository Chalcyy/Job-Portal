import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../../api/client';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

const emptyForm = {
  title: '',
  description: '',
  location: '',
  jobType: 'full-time',
  skills: '',
  experienceMin: 0,
  experienceMax: '',
  salaryMin: '',
  salaryMax: '',
  openings: 1,
  applicationDeadline: '',
};

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        jobType: form.jobType,
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        experienceMin: Number(form.experienceMin) || 0,
        experienceMax: form.experienceMax ? Number(form.experienceMax) : undefined,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        openings: Number(form.openings) || 1,
        applicationDeadline: form.applicationDeadline || undefined,
      };
      await jobsApi.create(payload);
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      <h1>Post a new job</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="full-width">
            Job title
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label>
            Location
            <input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </label>
          <label>
            Job type
            <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace('-', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="full-width">
            Skills (comma separated)
            <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          </label>
          <label>
            Min experience (years)
            <input
              type="number"
              min="0"
              value={form.experienceMin}
              onChange={(e) => setForm({ ...form, experienceMin: e.target.value })}
            />
          </label>
          <label>
            Max experience (years)
            <input
              type="number"
              min="0"
              value={form.experienceMax}
              onChange={(e) => setForm({ ...form, experienceMax: e.target.value })}
            />
          </label>
          <label>
            Salary min (INR)
            <input
              type="number"
              value={form.salaryMin}
              onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
            />
          </label>
          <label>
            Salary max (INR)
            <input
              type="number"
              value={form.salaryMax}
              onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
            />
          </label>
          <label>
            Openings
            <input
              type="number"
              min="1"
              value={form.openings}
              onChange={(e) => setForm({ ...form, openings: e.target.value })}
            />
          </label>
          <label>
            Application deadline
            <input
              type="date"
              value={form.applicationDeadline}
              onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
            />
          </label>
          <label className="full-width">
            Job description
            <textarea
              required
              rows={8}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Posting...' : 'Post job'}
        </button>
      </form>
    </div>
  );
}
