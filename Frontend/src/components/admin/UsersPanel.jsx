import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Pencil, ShieldCheck, Siren, Trash2, UserCheck, UserX, X } from "lucide-react";
import { deleteUser, updateUser } from "../../api/auth";
import { useAuth } from "../../auth/AuthContext";
import { errorMessage, formatDateTime } from "../../utils/format";
import { Skeleton, Spinner } from "../common/Loading";
import ErrorState from "../common/ErrorState";

const FILTERS = [
  { id: "pending", label: "Pending" },
  { id: "active", label: "Active" },
  { id: "disabled", label: "Disabled" },
  { id: "all", label: "All" },
];

export default function UsersPanel({ users, loading, error, reload, divisions, onClose }) {
  const pending = users.filter((u) => u.status === "pending").length;
  const [filter, setFilter] = useState(pending > 0 ? "pending" : "active");
  const dialogRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const counts = useMemo(() => {
    const c = { all: users.length, pending: 0, active: 0, disabled: 0 };
    users.forEach((u) => { c[u.status] = (c[u.status] || 0) + 1; });
    return c;
  }, [users]);

  const shown = filter === "all" ? users : users.filter((u) => u.status === filter);

  return (
    <div className="fixed inset-0 z-[1200] flex items-start sm:items-center justify-center bg-slate-900/40 p-3 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="users-title"
        className="card w-full max-w-3xl max-h-[calc(100vh-24px)] sm:max-h-[85vh] flex flex-col outline-none animate-fade-in"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="users-title" className="text-base font-semibold text-slate-900">Accounts</h2>
            <p className="text-sm text-slate-500">Approve police sign-ups and set which divisions each officer can see.</p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn border-transparent" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-200 px-3" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.id} type="button" role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}
              className={`relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium ${filter === f.id ? "text-slate-900" : "text-slate-500 hover:text-slate-800"}`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 text-[11px] ${f.id === "pending" && counts.pending ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                {counts[f.id] || 0}
              </span>
              {filter === f.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-slate-900" />}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scroll-thin bg-slate-50/60 p-3 space-y-2">
          {error && <ErrorState title="Couldn't load accounts" message={errorMessage(error)} onRetry={reload} />}
          {loading && users.length === 0 && [0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}
          {!loading && !error && shown.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              {filter === "pending" ? "No sign-ups waiting for approval." : "No accounts here."}
            </div>
          )}
          {shown.map((u) => (
            <UserRow key={u.id} user={u} divisions={divisions} onChanged={reload} />
          ))}
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, divisions, onChanged }) {
  const { user: me } = useAuth();
  const isMe = me?.id === user.id;
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const act = async (name, fn) => {
    setBusy(name);
    setError(null);
    try {
      await fn();
      await onChanged();
      setEditing(false);
      setConfirmDelete(false);
    } catch (err) {
      setError(err.response?.data?.detail ? String(err.response.data.detail) : errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const isAdmin = user.role === "admin";
  const initials = (user.name || user.email).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

  return (
    <div className="card p-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className={`h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-semibold text-white ${isAdmin ? "bg-slate-900" : "bg-sky-700"}`}>
            {initials}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-900 truncate">{user.name}</span>
              {isMe && <span className="rounded bg-slate-100 px-1.5 text-[11px] text-slate-600">You</span>}
              <StatusBadge status={user.status} />
            </div>
            <div className="text-xs text-slate-500 truncate">{user.email} · joined {formatDateTime(user.created_at)}</div>
            <div className="mt-1 flex items-center gap-1 flex-wrap text-xs text-slate-700">
              {isAdmin ? <ShieldCheck className="h-3.5 w-3.5 text-slate-500" /> : <Siren className="h-3.5 w-3.5 text-slate-500" />}
              {isAdmin ? "Admin · all divisions" : user.divisions.join(", ") || "No division"}
            </div>
          </div>
        </div>

        {!editing && (
          <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
            {user.status === "pending" && (
              <ActionButton primary busy={busy === "approve"} icon={Check} onClick={() => act("approve", () => updateUser(user.id, { status: "active" }))}>
                Approve
              </ActionButton>
            )}
            {!isMe && user.status !== "pending" && (
              <ActionButton icon={Pencil} onClick={() => setEditing(true)} disabled={Boolean(busy)}>Edit</ActionButton>
            )}
            {!isMe && user.status === "active" && (
              <ActionButton busy={busy === "disable"} icon={UserX} onClick={() => act("disable", () => updateUser(user.id, { status: "disabled" }))}>
                Disable
              </ActionButton>
            )}
            {!isMe && user.status === "disabled" && (
              <ActionButton busy={busy === "enable"} icon={UserCheck} onClick={() => act("enable", () => updateUser(user.id, { status: "active" }))}>
                Enable
              </ActionButton>
            )}
            {!isMe && (confirmDelete ? (
              <>
                <ActionButton danger busy={busy === "delete"} icon={Trash2} onClick={() => act("delete", () => deleteUser(user.id))}>
                  {user.status === "pending" ? "Confirm reject" : "Confirm delete"}
                </ActionButton>
                <ActionButton onClick={() => setConfirmDelete(false)}>Cancel</ActionButton>
              </>
            ) : (
              <ActionButton icon={user.status === "pending" ? X : Trash2} onClick={() => setConfirmDelete(true)} disabled={Boolean(busy)}>
                {user.status === "pending" ? "Reject" : "Delete"}
              </ActionButton>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <AccessEditor
          user={user} isMe={isMe} divisions={divisions} busy={busy === "save"}
          onCancel={() => { setEditing(false); setError(null); }}
          onSave={(changes) => act("save", () => updateUser(user.id, changes))}
        />
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function AccessEditor({ user, isMe, divisions, busy, onCancel, onSave }) {
  const [role, setRole] = useState(user.role);
  const [selected, setSelected] = useState(() => new Set(user.divisions));
  const toggle = (d) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(d)) next.delete(d); else next.add(d);
    return next;
  });
  const invalid = role === "police" && selected.size === 0;

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
      <div>
        <div className="eyebrow mb-1.5">Role</div>
        <div className="inline-grid grid-cols-2 gap-1 rounded-lg bg-white border border-slate-200 p-1">
          {["police", "admin"].map((r) => (
            <button
              key={r} type="button" onClick={() => setRole(r)} disabled={isMe && r === "police"}
              className={`h-8 px-3 rounded-md text-sm font-medium capitalize disabled:opacity-40 ${role === r ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {role === "police" && (
        <div>
          <div className="eyebrow mb-1.5">Jurisdiction ({selected.size} selected)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-48 overflow-y-auto scroll-thin pr-1">
            {divisions.map((d) => (
              <label key={d} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-white cursor-pointer">
                <input type="checkbox" checked={selected.has(d)} onChange={() => toggle(d)} className="h-4 w-4 rounded border-slate-300 accent-slate-900" />
                {d}
              </label>
            ))}
          </div>
          {invalid && <p className="mt-1 text-xs text-red-600">Pick at least one division.</p>}
        </div>
      )}

      <div className="flex justify-end gap-1.5">
        <ActionButton onClick={onCancel}>Cancel</ActionButton>
        <ActionButton
          primary busy={busy} icon={Check} disabled={invalid}
          onClick={() => onSave(role === "admin" ? { role } : { role, divisions: [...selected] })}
        >
          Save
        </ActionButton>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    disabled: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return <span className={`rounded border px-1.5 text-[11px] font-medium capitalize ${styles[status]}`}>{status}</span>;
}

function ActionButton({ children, icon: Icon, onClick, busy, disabled, primary, danger }) {
  const tone = primary
    ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
    : danger
      ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50";
  return (
    <button
      type="button" onClick={onClick} disabled={busy || disabled}
      className={`h-8 inline-flex items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${tone}`}
    >
      {busy ? <Spinner className="h-3.5 w-3.5" /> : Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}
