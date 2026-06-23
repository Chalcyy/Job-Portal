const STATUS_COLORS = {
  applied: 'blue',
  reviewed: 'purple',
  shortlisted: 'green',
  interview: 'orange',
  offered: 'success',
  rejected: 'red',
  withdrawn: 'gray',
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${STATUS_COLORS[status] || 'gray'}`}>{status}</span>;
}
