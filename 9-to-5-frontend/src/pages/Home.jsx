import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsApi } from '../api/client';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

const JOB_TYPES = ['', 'full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Debounced search trigger when filter values change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      params.set('page', '1');
      setSearchParams(params);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters.search, filters.location, filters.jobType]);

  // Fetch suggestions when search input changes
  useEffect(() => {
    if (!filters.search.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await jobsApi.suggestions(filters.search);
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    let cancelled = false;

    async function fetchJobs() {
      setLoading(true);
      setError('');
      try {
        const params = { page: searchParams.get('page') || 1, limit: 12 };
        ['search', 'location', 'jobType', 'sort'].forEach((key) => {
          const value = searchParams.get(key);
          if (value) params[key] = value;
        });

        const data = await jobsApi.list(params);
        if (!cancelled) {
          setJobs(data.jobs);
          setMeta({ page: data.page, pages: data.pages, total: data.total });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchJobs();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
  };

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Find your dream job</h1>
          <p>Search thousands of openings from top companies across India</p>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Job title, skills, or company"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="suggestion-item"
                      onClick={() => {
                        setFilters({ ...filters, search: sug.text });
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="suggestion-icon">
                        {sug.type === 'company' ? '🏢' : sug.type === 'title' ? '💼' : '🛠️'}
                      </span>
                      <span className="suggestion-text">{sug.text}</span>
                      <span className="suggestion-badge">{sug.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
            <select
              value={filters.jobType}
              onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
            >
              {JOB_TYPES.map((type) => (
                <option key={type || 'all'} value={type}>
                  {type ? type.replace('-', ' ') : 'All job types'}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">
              Search Jobs
            </button>
          </form>
        </div>
      </section>

      <section className="container jobs-section">
        <div className="jobs-header">
          <h2>{meta.total > 0 ? `${meta.total} jobs found` : 'Browse jobs'}</h2>
          <select
            value={filters.sort}
            onChange={(e) => {
              const next = { ...filters, sort: e.target.value };
              setFilters(next);
              const params = new URLSearchParams(searchParams);
              params.set('sort', e.target.value);
              setSearchParams(params);
            }}
            className="sort-select"
          >
            <option value="newest">Newest first</option>
            <option value="salary">Highest salary</option>
            <option value="relevance">Most relevant</option>
          </select>
        </div>

        {loading && <LoadingSpinner />}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && jobs.length === 0 && (
          <div className="empty-state">
            <h3>No jobs found</h3>
            <p>Try adjusting your search filters or check back later.</p>
          </div>
        )}

        <div className="jobs-grid">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>

        {meta.pages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={meta.page <= 1}
              onClick={() => goToPage(meta.page - 1)}
            >
              Previous
            </button>
            <span>
              Page {meta.page} of {meta.pages}
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={meta.page >= meta.pages}
              onClick={() => goToPage(meta.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
