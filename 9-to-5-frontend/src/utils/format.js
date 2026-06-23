export function formatSalary(min, max, currency = 'INR') {
  if (!min && !max) return 'Not disclosed';
  const symbol = currency === 'INR' ? '₹' : currency;
  if (min && max) return `${symbol}${formatNumber(min)} - ${symbol}${formatNumber(max)}`;
  if (min) return `${symbol}${formatNumber(min)}+`;
  return `Up to ${symbol}${formatNumber(max)}`;
}

function formatNumber(n) {
  if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} LPA`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

export function formatExperience(min, max) {
  if (min === 0 && !max) return 'Fresher';
  if (min && max) return `${min}-${max} yrs`;
  if (min) return `${min}+ yrs`;
  return `Up to ${max} yrs`;
}

export function formatJobType(type) {
  return type?.replace('-', ' ') || 'Full time';
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function resumeUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  return `${base}${path}`;
}
