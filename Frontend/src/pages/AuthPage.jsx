import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Flame, Info, LogIn, ShieldCheck, Siren, UserPlus } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { fetchSignupDivisions } from "../api/auth";
import { Spinner } from "../components/common/Loading";

export default function AuthPage() {
  const { notice } = useAuth();
  const [mode, setMode] = useState("signin");
  const [flash, setFlash] = useState(notice ? { kind: "info", text: notice } : null);
  const [prefillEmail, setPrefillEmail] = useState("");

  const switchMode = (m) => {
    setMode(m);
    setFlash(null);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] bg-slate-100">
      <BrandPanel />

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <MobileBrand />

          <div className="card p-6 sm:p-7 animate-fade-in">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Account">
              <ModeTab active={mode === "signin"} onClick={() => switchMode("signin")}>Sign in</ModeTab>
              <ModeTab active={mode === "signup"} onClick={() => switchMode("signup")}>Create account</ModeTab>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900">
                {mode === "signin" ? "Welcome back" : "Request police access"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {mode === "signin"
                  ? "Sign in to view hotspot predictions."
                  : "Officers see predictions for their own police division."}
              </p>
            </div>

            {flash && (
              <div
                className={`mt-4 flex gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                  flash.kind === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-sky-200 bg-sky-50 text-sky-800"
                }`}
                role="status"
              >
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{flash.text}</span>
              </div>
            )}

            <div className="mt-5">
              {mode === "signin" ? (
                <SignInForm key={prefillEmail} defaultEmail={prefillEmail} />
              ) : (
                <SignUpForm
                  onPending={(email, message) => {
                    setPrefillEmail(email);
                    setMode("signin");
                    setFlash({ kind: "success", text: message });
                  }}
                />
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Admin accounts are issued by the system administrator.
          </p>
        </div>
      </main>
    </div>
  );
}

/* ── Forms ─────────────────────────────────────────────────────────── */

function SignInForm({ defaultEmail = "" }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const { busy, slow, error, run } = useSubmit();

  const submit = (e) => {
    e.preventDefault();
    run(() => signIn(email.trim(), password));
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Email" htmlFor="si-email">
        <input
          id="si-email" type="email" autoComplete="email" required autoFocus={!defaultEmail}
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="input" placeholder="you@police.lk"
        />
      </Field>
      <Field label="Password" htmlFor="si-password">
        <PasswordInput
          id="si-password" autoComplete="current-password" autoFocus={Boolean(defaultEmail)}
          value={password} onChange={setPassword}
        />
      </Field>

      <FormError error={error} />
      <SubmitButton busy={busy} slow={slow} disabled={!email || !password} icon={LogIn}>
        Sign in
      </SubmitButton>
    </form>
  );
}

function SignUpForm({ onPending }) {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", division: "", password: "", confirm: "" });
  const [divisions, setDivisions] = useState(null);
  const [divisionsError, setDivisionsError] = useState(false);
  const { busy, slow, error, run, setError } = useSubmit();

  useEffect(() => {
    let cancelled = false;
    fetchSignupDivisions()
      .then((d) => !cancelled && setDivisions(d))
      .catch(() => !cancelled && setDivisionsError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const tooShort = form.password.length > 0 && form.password.length < 8;
  const mismatch = form.confirm.length > 0 && form.confirm !== form.password;
  const complete = form.name.trim().length >= 2 && form.email && form.division && form.password.length >= 8 && form.confirm === form.password;

  const submit = (e) => {
    e.preventDefault();
    if (!complete) {
      setError("Please fill in every field.");
      return;
    }
    run(async () => {
      const res = await signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        division: form.division,
      });
      if (!res.access_token) onPending(form.email.trim(), res.message || "Account created. Wait for an admin to approve it.");
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Full name" htmlFor="su-name">
        <input id="su-name" autoComplete="name" required autoFocus value={form.name} onChange={set("name")} className="input" placeholder="e.g. N. Perera" />
      </Field>
      <Field label="Official email" htmlFor="su-email">
        <input id="su-email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} className="input" placeholder="you@police.lk" />
      </Field>
      <Field
        label="Police division"
        htmlFor="su-division"
        hint="You'll only see hotspots inside this division."
      >
        <select
          id="su-division" required value={form.division} onChange={set("division")}
          className="select w-full h-10" disabled={!divisions}
        >
          <option value="" disabled>
            {divisions ? "Select your division" : divisionsError ? "Couldn't load divisions" : "Loading divisions…"}
          </option>
          {(divisions || []).map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" htmlFor="su-password" hint={tooShort ? undefined : "At least 8 characters."} error={tooShort ? "At least 8 characters." : undefined}>
          <PasswordInput id="su-password" autoComplete="new-password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
        </Field>
        <Field label="Confirm password" htmlFor="su-confirm" error={mismatch ? "Passwords don't match." : undefined}>
          <PasswordInput id="su-confirm" autoComplete="new-password" value={form.confirm} onChange={(v) => setForm((f) => ({ ...f, confirm: v }))} />
        </Field>
      </div>

      <FormError error={error} />
      <SubmitButton busy={busy} slow={slow} disabled={!complete} icon={UserPlus}>
        Create account
      </SubmitButton>
    </form>
  );
}

/* ── Pieces ────────────────────────────────────────────────────────── */

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const run = async (fn) => {
    setBusy(true);
    setSlow(false);
    setError(null);
    timer.current = setTimeout(() => setSlow(true), 4000);
    try {
      await fn();
    } catch (err) {
      setError(describe(err));
    } finally {
      clearTimeout(timer.current);
      setBusy(false);
      setSlow(false);
    }
  };
  return { busy, slow, error, run, setError };
}

function describe(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const first = detail[0];
    const field = first?.loc?.[first.loc.length - 1];
    if (field === "email") return "Enter a valid email address.";
    if (field === "password") return "Password must be at least 8 characters.";
    if (field === "name") return "Enter your full name.";
    return first?.msg || "Please check the form.";
  }
  if (!err?.response) return "Can't reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete, autoFocus }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id} type={show ? "text" : "password"} autoComplete={autoComplete} autoFocus={autoFocus} required
        value={value} onChange={(e) => onChange(e.target.value)} className="input pr-10"
      />
      <button
        type="button" onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-700"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function FormError({ error }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
      {error}
    </div>
  );
}

function SubmitButton({ busy, slow, disabled, icon: Icon, children }) {
  return (
    <div>
      <button
        type="submit" disabled={busy || disabled}
        className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-medium text-white
          hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 focus-visible:ring-offset-2"
      >
        {busy ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : <Icon className="h-4 w-4" />}
        {children}
      </button>
      {slow && (
        <p className="mt-2 text-xs text-slate-500 text-center">
          Waking up the server. The first request after a quiet spell can take up to a minute.
        </p>
      )}
    </div>
  );
}

function ModeTab({ active, onClick, children }) {
  return (
    <button
      type="button" role="tab" aria-selected={active} onClick={onClick}
      className={`h-9 rounded-md text-sm font-medium transition-colors ${
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function MobileBrand() {
  return (
    <div className="lg:hidden mb-6 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-sm">
        <Flame className="h-5 w-5" />
      </div>
      <div>
        <div className="text-base font-semibold text-slate-900 leading-tight">Colombo Accident Hotspot Prediction</div>
        <div className="text-xs text-slate-500">CMC area · explainable predictions</div>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-slate-900 p-10 xl:p-14 text-white">
      <HexPattern />
      <div className="relative flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center shadow-sm">
          <Flame className="h-5 w-5" />
        </div>
        <div className="text-sm font-medium text-slate-300">Traffic Risk Dashboard</div>
      </div>

      <div className="relative max-w-md">
        <h1 className="text-3xl xl:text-4xl font-semibold leading-tight tracking-tight">
          Colombo Accident Hotspot Prediction
        </h1>
        <p className="mt-4 text-slate-300 leading-relaxed">
          Monthly hotspot and severity predictions for the CMC area, with the reasons behind each one.
        </p>

        <div className="mt-10 space-y-3">
          <AccessRow icon={ShieldCheck} title="Administrators" text="Every police division across the CMC area, plus account approvals." />
          <AccessRow icon={Siren} title="Police officers" text="Hotspots inside their own division only." />
        </div>
      </div>

      <p className="relative text-xs text-slate-500">BSc Honours dissertation project · predictions use a 2023 test window</p>
    </aside>
  );
}

function AccessRow({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <Icon className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-sm text-slate-400">{text}</div>
      </div>
    </div>
  );
}

// One tile of a flat-topped hexagon grid (side 28): a full hex plus the four neighbours that cross the tile edges.
const hex = (x, y) => `M${x + 14} ${y}h28l14 24.25l-14 24.25h-28l-14-24.25z`;
const HEX_TILE = [hex(0, 0), hex(42, 24.25), hex(42, -24.25), hex(-42, 24.25), hex(-42, -24.25)].join("");

/** Faint H3-style hexagon field in the background. */
function HexPattern() {
  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id="hexes" width="84" height="48.5" patternUnits="userSpaceOnUse">
          <path
            d={HEX_TILE}
            fill="none" stroke="rgb(148 163 184 / 0.10)" strokeWidth="1"
          />
        </pattern>
        <radialGradient id="glow" cx="85%" cy="15%" r="60%">
          <stop offset="0%" stopColor="rgb(220 38 38 / 0.22)" />
          <stop offset="100%" stopColor="rgb(220 38 38 / 0)" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexes)" />
      <rect width="100%" height="100%" fill="url(#glow)" />
    </svg>
  );
}
