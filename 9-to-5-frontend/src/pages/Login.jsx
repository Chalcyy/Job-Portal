import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { candidatesApi, companiesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('candidate');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const api = role === 'candidate' ? candidatesApi : companiesApi;
      const data = await api.login(form);
      login(data, role);
      navigate(role === 'company' ? '/company/dashboard' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="muted">Login to continue to 9-to-5</p>

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
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
