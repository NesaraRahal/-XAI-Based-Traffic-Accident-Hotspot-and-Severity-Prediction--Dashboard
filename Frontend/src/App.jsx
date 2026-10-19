import DashboardLayout from "./components/layout/DashboardLayout";
import AuthPage from "./pages/AuthPage";
import Loading from "./components/common/Loading";
import ErrorState from "./components/common/ErrorState";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { API_BASE_URL } from "./api/client";
import { errorMessage } from "./utils/format";

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { status, error, retryCheck, signOut } = useAuth();

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        {error ? (
          <div className="w-full max-w-lg space-y-3">
            <ErrorState
              title="Can't reach the prediction API"
              message={`Tried ${API_BASE_URL} (${errorMessage(error)}). Make sure the FastAPI backend is running.`}
              onRetry={retryCheck}
            />
            <button type="button" onClick={signOut} className="text-sm text-slate-500 hover:text-slate-800 underline">
              Sign out instead
            </button>
          </div>
        ) : (
          <Loading label="Checking your session…" />
        )}
      </div>
    );
  }
  if (status === "signedOut") return <AuthPage />;
  return <DashboardLayout />;
}
