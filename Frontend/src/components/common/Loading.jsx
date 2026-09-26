export default function Loading({ label = "Loading…", className = "" }) {
  return (
    <div className={`flex items-center gap-2 text-slate-500 text-sm p-4 ${className}`} role="status">
      <Spinner />
      {label}
    </div>
  );
}

export function Spinner({ className = "h-4 w-4" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 ${className}`}
      aria-hidden="true"
    />
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/80 ${className}`} />;
}
