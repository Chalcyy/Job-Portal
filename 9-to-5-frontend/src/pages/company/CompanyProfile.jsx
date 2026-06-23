import { useEffect, useState } from 'react';
import { companiesApi } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    companiesApi
      .profile()
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await companiesApi.updateProfile({
        name: profile.name,
        website: profile.website,
        industry: profile.industry,
        companySize: profile.companySize,
        description: profile.description,
        logoUrl: profile.logoUrl,
        location: profile.location,
        foundedYear: profile.foundedYear ? Number(profile.foundedYear) : undefined,
      });
      setProfile(updated);
      setSuccess('Company profile updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="container alert alert-error">{error}</div>;

  return (
    <div className="container page">
      <h1>Company Profile</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="profile-form" onSubmit={handleSave}>
        <div className="form-grid">
          <label>
            Company name
            <input
              required
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </label>
          <label>
            Industry
            <input
              value={profile.industry || ''}
              onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
            />
          </label>
          <label>
            Location
            <input
              value={profile.location || ''}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </label>
          <label>
            Company size
            <select
              value={profile.companySize || ''}
              onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
            >
              <option value="">Select size</option>
              {COMPANY_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label>
            Website
            <input
              type="url"
              value={profile.website || ''}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            />
          </label>
          <label>
            Logo URL
            <input
              value={profile.logoUrl || ''}
              onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
            />
          </label>
          <label>
            Founded year
            <input
              type="number"
              value={profile.foundedYear || ''}
              onChange={(e) => setProfile({ ...profile, foundedYear: e.target.value })}
            />
          </label>
          <label className="full-width">
            Description
            <textarea
              rows={5}
              value={profile.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
