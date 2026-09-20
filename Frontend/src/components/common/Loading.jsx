export default function Loading({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-slate-500 text-sm p-4">
      <div className="w-3 h-3 rounded-full bg-slate-400 animate-pulse" />
      {label}
    </div>
  );
}