import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobsApi } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    jobsApi
      .get(id)
      .then((job) =>
        setForm({
          title: job.title,
          description: job.description,
          location: job.location,
          jobType: job.jobType,
          skills: (job.skills || []).join(', '),
          experienceMin: job.experienceMin ?? 0,
          experienceMax: job.experienceMax ?? '',
          salaryMin: job.salaryMin ?? '',
          salaryMax: job.salaryMax ?? '',
          openings: job.openings ?? 1,
          applicationDeadline: job.applicationDeadline
            ? job.applicationDeadline.slice(0, 10)
            : '',
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await jobsApi.update(id, {
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
      });
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!form) return <div className="container alert alert-error">{error}</div>;

  return (
    <div className="container page">
      <h1>Edit job</h1>
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
            Min experience
            <input
              type="number"
              value={form.experienceMin}
              onChange={(e) => setForm({ ...form, experienceMin: e.target.value })}
            />
          </label>
          <label>
            Max experience
            <input
              type="number"
              value={form.experienceMax}
              onChange={(e) => setForm({ ...form, experienceMax: e.target.value })}
            />
          </label>
          <label>
            Salary min
            <input
              type="number"
              value={form.salaryMin}
              onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
            />
          </label>
          <label>
            Salary max
            <input
              type="number"
              value={form.salaryMax}
              onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
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
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
