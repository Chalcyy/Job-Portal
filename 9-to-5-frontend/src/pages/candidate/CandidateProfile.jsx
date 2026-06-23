import { useEffect, useState } from 'react';
import { candidatesApi } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { resumeUrl } from '../../utils/format';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function CandidateProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    candidatesApi
      .profile()
      .then((data) => {
        setProfile(data);
        setSkillsInput((data.skills || []).join(', '));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: profile.name,
        phone: profile.phone,
        headline: profile.headline,
        summary: profile.summary,
        location: profile.location,
        skills: skillsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        preferredJobTypes: profile.preferredJobTypes || [],
        expectedSalary: profile.expectedSalary,
      };

      let updated = await candidatesApi.updateProfile(payload);
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        updated = await candidatesApi.updateProfileWithResume(formData);
      }

      setProfile(updated);
      setSkillsInput((updated.skills || []).join(', '));
      setResumeFile(null);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleJobType = (type) => {
    const current = profile.preferredJobTypes || [];
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    setProfile({ ...profile, preferredJobTypes: next });
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="container alert alert-error">{error}</div>;

  return (
    <div className="container page">
      <h1>My Profile</h1>
      <p className="muted">Complete your profile to get better job matches</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="profile-form" onSubmit={handleSave}>
        <div className="form-grid">
          <label>
            Full name
            <input
              required
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </label>
          <label>
            Phone
            <input
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </label>
          <label className="full-width">
            Headline
            <input
              placeholder="e.g. Full Stack Developer with 3 years experience"
              value={profile.headline || ''}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            />
          </label>
          <label className="full-width">
            Location
            <input
              value={profile.location || ''}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </label>
          <label className="full-width">
            Summary
            <textarea
              rows={4}
              value={profile.summary || ''}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
            />
          </label>
          <label className="full-width">
            Skills (comma separated)
            <input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
          </label>
        </div>

        <fieldset>
          <legend>Preferred job types</legend>
          <div className="checkbox-group">
            {JOB_TYPES.map((type) => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(profile.preferredJobTypes || []).includes(type)}
                  onChange={() => toggleJobType(type)}
                />
                {type.replace('-', ' ')}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-grid">
          <label>
            Expected salary (min)
            <input
              type="number"
              value={profile.expectedSalary?.min || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  expectedSalary: { ...profile.expectedSalary, min: Number(e.target.value) || undefined },
                })
              }
            />
          </label>
          <label>
            Expected salary (max)
            <input
              type="number"
              value={profile.expectedSalary?.max || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  expectedSalary: { ...profile.expectedSalary, max: Number(e.target.value) || undefined },
                })
              }
            />
          </label>
        </div>

        <label>
          Resume (PDF, DOC, DOCX)
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          />
        </label>
        {profile.resumeUrl && (
          <p>
            Current resume:{' '}
            <a href={resumeUrl(profile.resumeUrl)} target="_blank" rel="noreferrer">
              View
            </a>
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
