import { ChevronDown } from "lucide-react";
import { useState } from "react";

/** Collapsible card section used in the details panel. */
export default function Section({ title, subtitle, icon: Icon, defaultOpen = true, right, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50"
        aria-expanded={open}
      >
        {Icon && <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
        {right}
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-1 animate-fade-in">{children}</div>}
    </section>
  );
}
