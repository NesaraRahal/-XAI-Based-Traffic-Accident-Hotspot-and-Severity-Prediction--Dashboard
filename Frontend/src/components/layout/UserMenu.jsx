import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, ShieldCheck, Siren, Users } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export default function UserMenu({ onOpenUsers, pendingCount = 0 }) {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!user) return null;
  const initials = (user.name || user.email)
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

  return (
    <div className="flex items-end gap-2">
      {isAdmin && (
        <button
          type="button" onClick={onOpenUsers}
          className="relative h-9 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-700 hover:bg-slate-50"
          title="Manage accounts"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Users</span>
          {pendingCount > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-semibold text-white">
              {pendingCount}
            </span>
          )}
        </button>
      )}

      <div className="relative" ref={ref}>
        <button
          type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
          className="h-9 inline-flex items-center gap-2 rounded-lg pl-1 pr-2 hover:bg-slate-100"
        >
          <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold text-white ${isAdmin ? "bg-slate-900" : "bg-sky-700"}`}>
            {initials}
          </span>
          <span className="hidden md:block text-left leading-tight">
            <span className="block text-sm font-medium text-slate-800 max-w-[140px] truncate">{user.name || user.email}</span>
            <span className="block text-[11px] text-slate-500">{isAdmin ? "Admin" : "Police"}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {open && (
          <div role="menu" className="absolute right-0 top-full z-[1100] mt-1 w-64 card p-1.5 animate-fade-in">
            <div className="px-2.5 py-2">
              <div className="text-sm font-medium text-slate-900 truncate">{user.name}</div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <Siren className="h-3.5 w-3.5" />}
                {isAdmin ? "Admin · all divisions" : user.divisions.join(", ")}
              </div>
            </div>
            <div className="my-1 h-px bg-slate-200" />
            <button
              type="button" role="menuitem" onClick={signOut}
              className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
