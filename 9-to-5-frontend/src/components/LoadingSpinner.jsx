export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}
