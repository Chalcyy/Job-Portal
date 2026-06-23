import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { companiesApi } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');

  const fetchCompanies = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = { limit: 20 };
      if (search) params.search = search;
      if (industry) params.industry = industry;
      if (location) params.location = location;
      const data = await companiesApi.list(params);
      setCompanies(data.companies);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="container page">
      <h1>Top companies hiring</h1>
      <form className="filter-bar" onSubmit={fetchCompanies}>
        <input
          type="text"
          placeholder="Company Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Filter
        </button>
      </form>

      {loading && <LoadingSpinner />}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="companies-grid">
        {companies.map((company) => (
          <Link key={company._id} to={`/companies/${company._id}`} className="company-card">
            <div className="company-logo">{company.name[0]}</div>
            <div>
              <h3>{company.name}</h3>
              <p>{company.industry || 'Industry not listed'}</p>
              <p className="muted">{company.location || 'Location not listed'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
