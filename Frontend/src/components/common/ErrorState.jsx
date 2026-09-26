import { RotateCcw, TriangleAlert } from "lucide-react";

export default function ErrorState({ title = "Something went wrong", message, onRetry, className = "" }) {
  return (
    <div className={`rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 ${className}`} role="alert">
      <div className="flex items-start gap-3">
        <TriangleAlert className="h-5 w-5 flex-shrink-0 text-red-500" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{title}</div>
          {message && <div className="mt-0.5 text-red-700/90 break-words">{message}</div>}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </button>
        )}
      </div>
    </div>
  );
}
