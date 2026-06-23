import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { candidatesApi, companiesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [candidateForm, setCandidateForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [companyForm, setCompanyForm] = useState({
    name: '',
    email: '',
    password: '',
    website: '',
    industry: '',
    companySize: '',
    location: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (role === 'candidate') {
        const data = await candidatesApi.register(candidateForm);
        login(data, 'candidate');
        navigate('/profile');
      } else {
        const payload = { ...companyForm };
        if (!payload.companySize) delete payload.companySize;
        const data = await companiesApi.register(payload);
        login(data, 'company');
        navigate('/company/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-card auth-card-wide">
        <h1>Create your account</h1>
        <p className="muted">Join 9-to-5 as a job seeker or employer</p>

        <div className="role-toggle">
          <button
            type="button"
            className={role === 'candidate' ? 'active' : ''}
            onClick={() => setRole('candidate')}
          >
            Job Seeker
          </button>
          <button
            type="button"
            className={role === 'company' ? 'active' : ''}
            onClick={() => setRole('company')}
          >
            Employer
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {role === 'candidate' ? (
            <div className="form-grid">
              <label>
                Full name
                <input
                  required
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  value={candidateForm.phone}
                  onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                />
              </label>
              <label className="full-width">
                Email
                <input
                  type="email"
                  required
                  value={candidateForm.email}
                  onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                />
              </label>
              <label className="full-width">
                Password
                <input
                  type="password"
                  required
                  minLength={6}
                  value={candidateForm.password}
                  onChange={(e) => setCandidateForm({ ...candidateForm, password: e.target.value })}
                />
              </label>
            </div>
          ) : (
            <div className="form-grid">
              <label>
                Company name
                <input
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                />
              </label>
              <label>
                Industry
                <input
                  value={companyForm.industry}
                  onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                />
              </label>
              <label>
                Location
                <input
                  value={companyForm.location}
                  onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                />
              </label>
              <label>
                Company size
                <select
                  value={companyForm.companySize}
                  onChange={(e) => setCompanyForm({ ...companyForm, companySize: e.target.value })}
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} employees
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-width">
                Website
                <input
                  type="url"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  required
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  required
                  minLength={6}
                  value={companyForm.password}
                  onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                />
              </label>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
